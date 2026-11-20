import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { DATASET } from '../../engine/simulator';

// Accurate LatLng to 3D Sphere conversion aligned with Three.js equirectangular UV mapping
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = ((lng + 180) / 360) * (2 * Math.PI);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// 3D Curved Quadratic Bézier Arc over the Earth sphere
function createGeodesicArc(v1: THREE.Vector3, v2: THREE.Vector3, altitudeMultiplier: number = 1.08): { points: THREE.Vector3[]; p0: THREE.Vector3; p1: THREE.Vector3; p2: THREE.Vector3 } {
  const distance = v1.distanceTo(v2);
  const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
  const midLength = mid.length();
  mid.normalize().multiplyScalar(midLength * altitudeMultiplier + distance * 0.07);

  const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
  return {
    points: curve.getPoints(50),
    p0: v1,
    p1: mid,
    p2: v2
  };
}

export const NightGlobeView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    activeOutput,
    currentTimeMin,
    closureAirport,
    selectedFlightId
  } = useSimulationStore();

  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  // 2D Screen projected positions for interactive airport labels
  const [screenLabels, setScreenLabels] = useState<Array<{ id: string; x: number; y: number; isVisible: boolean; isClosed: boolean }>>([]);
  const apVecMapRef = useRef<Map<string, THREE.Vector3>>(new Map());

  // 1. Initialize High-End 3D Earth Globe Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 145);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Calibrated position & orientation to center the Indian Subcontinent
    globeGroup.position.set(4, -4, 0);
    globeGroup.rotation.y = Math.PI + Math.atan2(8.96, 45.94) + 0.04; // ~3.37 rad
    globeGroup.rotation.x = -0.10;

    const radius = 62;

    // A. NASA Earth Night Texture with Golden City Lights
    const textureLoader = new THREE.TextureLoader();
    const nightTexture = textureLoader.load('/earth-night.jpg');
    nightTexture.colorSpace = THREE.SRGBColorSpace;

    const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: nightTexture,
      emissiveMap: nightTexture,
      emissive: new THREE.Color(0xffdf99), // Warm golden city lights glow
      emissiveIntensity: 0.95,
      specular: new THREE.Color(0x334466),
      shininess: 15
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // B. Atmospheric Blue Rim Glow (Outer Shell)
    const atmosGeo = new THREE.SphereGeometry(radius + 2.6, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // C. Scene Lighting (Orbital sunlight + ambient)
    const ambLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambLight);

    const sunLight = new THREE.DirectionalLight(0x7dd3fc, 1.8);
    sunLight.position.set(-90, 70, 110);
    scene.add(sunLight);

    // Cache 3D vectors for all Indian airports
    DATASET.airports.forEach(a => {
      apVecMapRef.current.set(a.id, latLngToVector3(a.lat, a.lng, radius + 0.4));
    });

    // 60 FPS Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Subtle ambient drift when not dragging
      if (!isDraggingRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.00010;
      }

      // Project 3D airport positions to 2D screen coordinates for sharp HTML labels
      if (globeGroupRef.current && cameraRef.current && containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;

        const updatedLabels: typeof screenLabels = [];
        DATASET.airports.forEach(ap => {
          const localVec = apVecMapRef.current.get(ap.id);
          if (!localVec) return;

          const worldVec = localVec.clone().applyMatrix4(globeGroupRef.current!.matrixWorld);
          const camDir = cameraRef.current!.position.clone().sub(worldVec).normalize();
          const normal = worldVec.clone().normalize();
          const dot = normal.dot(camDir);

          if (dot > 0.18) {
            const projected = worldVec.clone().project(cameraRef.current!);
            const sx = (projected.x * 0.5 + 0.5) * w;
            const sy = (-(projected.y * 0.5) + 0.5) * h;

            updatedLabels.push({
              id: ap.id,
              x: sx,
              y: sy,
              isVisible: true,
              isClosed: ap.id === closureAirport
            });
          }
        });
        setScreenLabels(updatedLabels);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse drag interaction
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      globeGroupRef.current.rotation.y += dx * 0.003;
      globeGroupRef.current.rotation.x = Math.max(
        -Math.PI / 4,
        Math.min(Math.PI / 4, globeGroupRef.current.rotation.x + dy * 0.003)
      );
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDraggingRef.current = false; };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const onResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // 2. Render Flight Arcs, Butter-Smooth Airplanes & Pulsing Red BOM Beacon
  useEffect(() => {
    if (!globeGroupRef.current) return;
    const group = globeGroupRef.current;

    // Clean up dynamic flight layers
    const toRemove: THREE.Object3D[] = [];
    group.traverse(child => {
      if (child.userData && child.userData.isFlightLayer) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(obj => group.remove(obj));

    const apVecs = apVecMapRef.current;

    // A. Pulsing Red Beacon over Closed Airport (e.g. BOM)
    if (closureAirport && apVecs.has(closureAirport)) {
      const v = apVecs.get(closureAirport)!;

      // 3 Concentric Glowing Rings
      [1.2, 2.4, 3.8].forEach((r, idx) => {
        const ringGeo = new THREE.RingGeometry(r, r + 0.45, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xef4444,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9 - idx * 0.25
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(v);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        ring.userData = { isFlightLayer: true };
        group.add(ring);
      });
    }

    // B. Airport Spherical Pin Dots
    DATASET.airports.forEach(ap => {
      const v = apVecs.get(ap.id);
      if (!v) return;

      const isClosed = ap.id === closureAirport;
      const dotGeo = new THREE.SphereGeometry(isClosed ? 1.4 : 0.8, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: isClosed ? 0xef4444 : 0xffffff
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(v);
      dot.userData = { isFlightLayer: true };
      group.add(dot);
    });

    // C. 3D Flight Arcs & Moving Airplanes
    Object.values(activeOutput.flights).forEach(flight => {
      const v1 = apVecs.get(flight.origin);
      const v2 = apVecs.get(flight.destination);
      if (!v1 || !v2) return;

      const { points: arcPoints, p0, p1, p2 } = createGeodesicArc(v1, v2, 1.08);
      const geom = new THREE.BufferGeometry().setFromPoints(arcPoints);

      let arcColor = 0x22d3ee; // Cyan for On Time
      let opacity = 0.55;

      if (flight.is_cancelled) {
        arcColor = 0xef4444; // Red for Cancelled
        opacity = 0.75;
      } else if (flight.dep_delay >= 60) {
        arcColor = 0xef4444; // Severe Red
        opacity = 0.85;
      } else if (flight.dep_delay > 0) {
        arcColor = 0xf59e0b; // Amber for Delayed
        opacity = 0.80;
      }

      if (selectedFlightId === flight.flight_id) {
        arcColor = 0xffffff;
        opacity = 1.0;
      }

      const mat = new THREE.LineBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity,
        linewidth: selectedFlightId === flight.flight_id ? 3 : 1.5
      });

      const line = new THREE.Line(geom, mat);
      line.userData = { isFlightLayer: true, flightId: flight.flight_id };
      group.add(line);

      // D. Butter-Smooth Airplanes Moving along the 3D Arc
      if (!flight.is_cancelled) {
        const dep = flight.actual_dep_min;
        const arr = flight.actual_arr_min;

        if (currentTimeMin >= dep && currentTimeMin <= arr) {
          const t = Math.max(0, Math.min(1, (currentTimeMin - dep) / (arr - dep)));

          // Analytical position on quadratic Bézier curve: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
          const pos = new THREE.Vector3()
            .addScaledVector(p0, (1 - t) * (1 - t))
            .addScaledVector(p1, 2 * (1 - t) * t)
            .addScaledVector(p2, t * t);

          // Analytical forward tangent: B'(t) = 2(1-t)(P1 - P0) + 2t(P2 - P1)
          const tangent = new THREE.Vector3()
            .addScaledVector(new THREE.Vector3().subVectors(p1, p0), 2 * (1 - t))
            .addScaledVector(new THREE.Vector3().subVectors(p2, p1), 2 * t)
            .normalize();

          // 3D Airplane Model: Sleek Delta Jet
          const airplaneGroup = new THREE.Group();
          airplaneGroup.position.copy(pos);

          // Fuselage cone
          const coneGeo = new THREE.ConeGeometry(0.75, 2.2, 8);
          const coneMat = new THREE.MeshBasicMaterial({
            color: flight.dep_delay > 0 ? 0xf59e0b : 0x22d3ee
          });
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.rotation.x = Math.PI / 2; // Orient along Z
          airplaneGroup.add(cone);

          // Wings
          const wingGeo = new THREE.BoxGeometry(2.4, 0.15, 0.8);
          const wingMat = new THREE.MeshBasicMaterial({
            color: flight.dep_delay > 0 ? 0xd97706 : 0x06b6d4
          });
          const wing = new THREE.Mesh(wingGeo, wingMat);
          wing.position.set(0, 0, -0.4);
          airplaneGroup.add(wing);

          // Smooth orientation along the tangent vector with ZERO wobble
          const targetPoint = pos.clone().add(tangent);
          airplaneGroup.lookAt(targetPoint);

          airplaneGroup.userData = { isFlightLayer: true, flightId: flight.flight_id };
          group.add(airplaneGroup);
        }
      }
    });
  }, [activeOutput, currentTimeMin, closureAirport, selectedFlightId]);

  return (
    <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center select-none">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 2D Screen-Projected Airport Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {screenLabels.map(lbl => (
          <div
            key={lbl.id}
            style={{
              transform: `translate(${lbl.x + 8}px, ${lbl.y - 8}px)`
            }}
            className="absolute transition-all duration-75 pointer-events-none"
          >
            <span className={`text-[10px] font-bold font-mono-numbers px-1.5 py-0.5 rounded ${
              lbl.isClosed
                ? 'text-rose-400 bg-rose-950/80 border border-rose-800 shadow-[0_0_8px_#FF0000]'
                : 'text-zinc-200 drop-shadow-[0_0_4px_#000000]'
            }`}>
              {lbl.id}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom-Left Map Legend (Exact match to screenshot) */}
      <div className="absolute bottom-6 left-6 p-3 rounded-xl bg-[#0E121B]/90 backdrop-blur-md border border-[#1C2433] text-xs font-mono-numbers space-y-2 pointer-events-auto z-10 shadow-2xl">
        <div className="flex items-center space-x-2.5 text-zinc-300">
          <span className="w-5 h-[2px] bg-cyan-400 rounded-full" />
          <span className="text-[11px] font-medium">On Time</span>
        </div>

        <div className="flex items-center space-x-2.5 text-zinc-300">
          <span className="w-5 h-[2px] bg-amber-400 rounded-full" />
          <span className="text-[11px] font-medium">Delayed</span>
        </div>

        <div className="flex items-center space-x-2.5 text-zinc-300">
          <span className="w-5 h-[2px] border-b-2 border-dashed border-rose-500" />
          <span className="text-[11px] font-medium">Cancelled</span>
        </div>
      </div>
    </div>
  );
};
