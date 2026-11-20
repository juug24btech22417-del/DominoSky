import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useSimulationStore } from '../../store/useSimulationStore';
import { DATASET } from '../../engine/simulator';
import { Layers, CloudRain, Plane, Eye } from 'lucide-react';

// Cubic Bezier position
function getBezierPoint(
  p0: { lat: number; lng: number },
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  t: number
) {
  const clampedT = Math.max(0, Math.min(1, t));
  const lat = (1 - clampedT) * (1 - clampedT) * p0.lat + 2 * (1 - clampedT) * clampedT * p1.lat + clampedT * clampedT * p2.lat;
  const lng = (1 - clampedT) * (1 - clampedT) * p0.lng + 2 * (1 - clampedT) * clampedT * p1.lng + clampedT * clampedT * p2.lng;
  return { lat, lng };
}

// Analytical derivative (Tangent velocity vector) - ZERO jitter / ZERO vibration!
function getBezierTangent(
  p0: { lat: number; lng: number },
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number },
  t: number
) {
  const clampedT = Math.max(0, Math.min(1, t));
  // dB/dt = 2(1-t)(P1 - P0) + 2t(P2 - P1)
  const dLat = 2 * (1 - clampedT) * (p1.lat - p0.lat) + 2 * clampedT * (p2.lat - p1.lat);
  const dLng = 2 * (1 - clampedT) * (p1.lng - p0.lng) + 2 * clampedT * (p2.lng - p1.lng);
  return { dLat, dLng };
}

export const AirspaceView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const flightCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const staticLayersGroupRef = useRef<L.LayerGroup | null>(null);

  const {
    activeOutput,
    currentTimeMin,
    closureAirport,
    closureDuration,
    selectedFlightId,
    selectFlight
  } = useSimulationStore();

  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [layers, setLayers] = useState({
    routes: true,
    aircraft: true,
    weather: true,
    airports: true
  });

  const [mapType, setMapType] = useState<'satellite' | 'dark'>('satellite');

  const animationFrameRef = useRef<number | null>(null);

  // 1. Initialize Base Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.5, 79.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 9,
      zoomControl: true,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    const staticGroup = L.layerGroup().addTo(map);
    staticLayersGroupRef.current = staticGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Base Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapType === 'satellite') {
      const satelliteTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          className: 'satellite-dark-filter'
        }
      );
      satelliteTile.addTo(map);

      L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { opacity: 0.35 }
      ).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19 }
      ).addTo(map);
    }
  }, [mapType]);

  // 3. Render Static Map Layers (Routes, Airports, Weather)
  useEffect(() => {
    if (!mapInstanceRef.current || !staticLayersGroupRef.current) return;
    const group = staticLayersGroupRef.current;
    group.clearLayers();

    const apMap = new Map<string, (typeof DATASET.airports)[0]>();
    DATASET.airports.forEach(a => apMap.set(a.id, a));

    // A. Doppler Weather Radar
    if (layers.weather && closureAirport) {
      const stormAp = apMap.get(closureAirport);
      if (stormAp) {
        const stormCluster = [
          { radius: 140000, color: '#10B981', opacity: 0.22 },
          { radius: 95000, color: '#F59E0B', opacity: 0.40 },
          { radius: 55000, color: '#EF4444', opacity: 0.60 },
          { radius: 25000, color: '#7C3AED', opacity: 0.75 }
        ];

        stormCluster.forEach(tier => {
          L.circle([stormAp.lat, stormAp.lng], {
            radius: tier.radius,
            color: tier.color,
            weight: 1,
            fillColor: tier.color,
            fillOpacity: tier.opacity,
            className: 'doppler-radar'
          }).addTo(group);
        });

        const radarLabel = L.divIcon({
          className: 'custom-radar-label',
          html: `<div style="background: rgba(18, 18, 18, 0.9); color: #fca5a5; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; font-family: monospace; border: 1px solid #7f1d1d; white-space: nowrap;">
            SEVERE STORM • ${closureAirport} (${closureDuration}m)
          </div>`,
          iconSize: [150, 20],
          iconAnchor: [75, 40]
        });
        L.marker([stormAp.lat, stormAp.lng], { icon: radarLabel }).addTo(group);
      }
    }

    // B. Flight Routes
    if (layers.routes) {
      Object.values(activeOutput.flights).forEach(flight => {
        const orig = apMap.get(flight.origin);
        const dest = apMap.get(flight.destination);
        if (!orig || !dest) return;

        const midLat = (orig.lat + dest.lat) / 2 + 1.2;
        const midLng = (orig.lng + dest.lng) / 2;

        const curvePoints: [number, number][] = [];
        const steps = 25;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const pt = getBezierPoint(orig, { lat: midLat, lng: midLng }, dest, t);
          curvePoints.push([pt.lat, pt.lng]);
        }

        let routeColor = '#3B82F6';
        let weight = 1.2;
        let opacity = 0.35;
        let dashArray: string | undefined = undefined;

        if (flight.is_cancelled) {
          routeColor = '#EF4444';
          opacity = 0.65;
          dashArray = '4, 6';
        } else if (flight.is_delayed) {
          routeColor = flight.dep_delay >= 60 ? '#EF4444' : '#F59E0B';
          opacity = 0.75;
          weight = 1.6;
        }

        if (selectedFlightId === flight.flight_id) {
          routeColor = '#FFFFFF';
          weight = 2.5;
          opacity = 0.95;
        }

        const polyline = L.polyline(curvePoints, {
          color: routeColor,
          weight,
          opacity,
          dashArray
        }).addTo(group);

        polyline.on('click', () => selectFlight(flight.flight_id));
      });
    }

    // C. Airport Hub Nodes
    if (layers.airports) {
      DATASET.airports.forEach(ap => {
        const isClosed = ap.id === closureAirport;
        const color = isClosed ? '#EF4444' : ap.tier === 'mega_hub' ? '#60A5FA' : '#94A3B8';
        const size = ap.tier === 'mega_hub' ? 5 : 3.5;

        L.circleMarker([ap.lat, ap.lng], {
          radius: size,
          fillColor: color,
          color: '#181818',
          weight: 1,
          fillOpacity: 0.95
        }).addTo(group);

        const apLabel = L.divIcon({
          className: 'ap-code-label',
          html: `<div style="font-family: monospace; font-size: 9px; font-weight: 600; color: ${isClosed ? '#EF4444' : '#d4d4d8'}; text-shadow: 0 0 3px #000000; margin-left: 7px; margin-top: -5px; pointer-events: none;">
            ${ap.id}
          </div>`,
          iconSize: [30, 14]
        });
        L.marker([ap.lat, ap.lng], { icon: apLabel }).addTo(group);
      });
    }
  }, [activeOutput, closureAirport, closureDuration, selectedFlightId, layers, selectFlight]);

  // 4. 60 FPS Smooth Radar Canvas with Mathematical Exact Analytical Tangent (ZERO JITTER)
  useEffect(() => {
    const canvas = flightCanvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const handleResize = () => {
      const { x, y } = map.getSize();
      canvas.width = x;
      canvas.height = y;
    };
    handleResize();
    map.on('resize', handleResize);

    const apMap = new Map<string, (typeof DATASET.airports)[0]>();
    DATASET.airports.forEach(a => apMap.set(a.id, a));

    let tickCount = 0;
    const render = () => {
      if (!isRunning) return;
      tickCount++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (layers.aircraft) {
        Object.values(activeOutput.flights).forEach(flight => {
          if (flight.is_cancelled) return;

          const depMin = flight.actual_dep_min;
          const arrMin = flight.actual_arr_min;

          if (currentTimeMin >= depMin && currentTimeMin <= arrMin) {
            const orig = apMap.get(flight.origin);
            const dest = apMap.get(flight.destination);
            if (!orig || !dest) return;

            const midLat = (orig.lat + dest.lat) / 2 + 1.2;
            const midLng = (orig.lng + dest.lng) / 2;
            const midPt = { lat: midLat, lng: midLng };

            const progress = Math.max(0, Math.min(1, (currentTimeMin - depMin) / (arrMin - depMin)));
            const curGeo = getBezierPoint(orig, midPt, dest, progress);

            // Screen pixel position of aircraft
            const screenPos = map.latLngToContainerPoint([curGeo.lat, curGeo.lng]);

            // Analytical Tangent Vector (ZERO wobble, closed-form derivative)
            const tangent = getBezierTangent(orig, midPt, dest, progress);
            const latRad = curGeo.lat * (Math.PI / 180);
            // In screen coordinates: X is East (dLng * cos(lat)), Y is South (-dLat)
            const screenTx = tangent.dLng * Math.cos(latRad);
            const screenTy = -tangent.dLat;
            const angle = Math.atan2(screenTy, screenTx);

            // Contrail Wake
            const isDelayed = flight.is_delayed;
            const wakeSteps = 8;
            ctx.beginPath();
            for (let i = 0; i <= wakeSteps; i++) {
              const wakeProg = Math.max(0, progress - (i / wakeSteps) * 0.035);
              const wakeGeo = getBezierPoint(orig, midPt, dest, wakeProg);
              const wakePos = map.latLngToContainerPoint([wakeGeo.lat, wakeGeo.lng]);
              if (i === 0) {
                ctx.moveTo(wakePos.x, wakePos.y);
              } else {
                ctx.lineTo(wakePos.x, wakePos.y);
              }
            }
            ctx.strokeStyle = isDelayed ? 'rgba(245, 158, 11, 0.40)' : 'rgba(59, 130, 246, 0.35)';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Aircraft Rendering
            ctx.save();
            ctx.translate(screenPos.x, screenPos.y);
            // Since plane silhouette nose is at (0, -10), rotate by angle + PI/2
            ctx.rotate(angle + Math.PI / 2);

            // Aircraft Silhouette (Nose strictly in front, rock-solid steady!)
            ctx.fillStyle = isDelayed ? '#F59E0B' : '#E4E4E7';
            ctx.beginPath();
            ctx.moveTo(0, -10);     // Nose Tip
            ctx.lineTo(2.5, -3);    // Cockpit right
            ctx.lineTo(10, 2);      // Right wingtip
            ctx.lineTo(9.5, 4.5);   // Right wing trail
            ctx.lineTo(2.5, 2);     // Right fuselage
            ctx.lineTo(2, 7);       // Right body
            ctx.lineTo(5, 9);       // Right tail tip
            ctx.lineTo(-5, 9);      // Left tail tip
            ctx.lineTo(-2, 7);      // Left body
            ctx.lineTo(-2.5, 2);    // Left fuselage
            ctx.lineTo(-9.5, 4.5);  // Left wing trail
            ctx.lineTo(-10, 2);     // Left wingtip
            ctx.lineTo(-2.5, -3);   // Cockpit left
            ctx.closePath();
            ctx.fill();

            // Wingtip navigation strobes
            const strobePhase = Math.floor(tickCount / 16) % 2 === 0;
            if (strobePhase) {
              // Left wing red strobe
              ctx.fillStyle = '#EF4444';
              ctx.beginPath();
              ctx.arc(-10, 2, 1.8, 0, Math.PI * 2);
              ctx.fill();

              // Right wing green strobe
              ctx.fillStyle = '#10B981';
              ctx.beginPath();
              ctx.arc(10, 2, 1.8, 0, Math.PI * 2);
              ctx.fill();

              // Tail white strobe
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(0, 9, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();

            // HUD Flight Callsign Tag
            ctx.save();
            const tagX = screenPos.x + 14;
            const tagY = screenPos.y - 9;
            const badgeText = isDelayed ? `+${flight.dep_delay}m` : 'ON-TIME';
            const statusColor = isDelayed ? '#F59E0B' : '#10B981';

            ctx.fillStyle = 'rgba(8, 8, 8, 0.90)';
            ctx.strokeStyle = '#262626';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(tagX, tagY, 68, 16, 2);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#F4F4F5';
            ctx.fillText(flight.flight_id, tagX + 4, tagY + 11);

            ctx.font = '8px monospace';
            ctx.fillStyle = statusColor;
            ctx.fillText(badgeText, tagX + 38, tagY + 11);

            ctx.restore();
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.off('resize', handleResize);
    };
  }, [activeOutput, currentTimeMin, layers.aircraft]);

  return (
    <div className="flex-1 relative bg-black overflow-hidden flex select-none">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 60 FPS Transparent Flight Radar Canvas Overlay */}
      <canvas
        ref={flightCanvasRef}
        className="absolute inset-0 pointer-events-none z-[400]"
      />

      <style>{`
        .satellite-dark-filter {
          filter: brightness(0.55) contrast(1.25) saturate(0.85) !important;
        }
      `}</style>

      {/* Top Left: Title Badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center space-x-2">
        <div className="px-3 py-1.5 rounded bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-xs font-mono-numbers text-zinc-200 flex items-center space-x-2 shadow-lg">
          <Plane className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-[11px] text-zinc-100">REAL-TIME AIRSPACE MONITOR</span>
          <span className="text-zinc-600">|</span>
          <span className="text-[10px] text-zinc-400">INDIA SECTOR</span>
        </div>

        <button
          onClick={() => setMapType(mapType === 'satellite' ? 'dark' : 'satellite')}
          className="px-2.5 py-1.5 rounded bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-[10px] font-mono-numbers text-zinc-300 hover:text-white transition flex items-center space-x-1"
        >
          <Eye className="w-3 h-3 text-zinc-400" />
          <span>{mapType === 'satellite' ? 'SATELLITE' : 'VECTOR'}</span>
        </button>
      </div>

      {/* Top Right: "Toggle Layers" Dropdown */}
      <div className="absolute top-3 right-3 z-[1000]">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="px-3 py-1.5 rounded bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-xs font-mono-numbers text-zinc-200 hover:bg-zinc-900 transition flex items-center space-x-2 shadow-lg"
        >
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-medium text-[11px]">Toggle Layers</span>
        </button>

        {showLayerMenu && (
          <div className="absolute right-0 mt-2 w-44 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded shadow-xl p-2.5 text-xs font-mono-numbers space-y-2 z-50">
            <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-800 pb-1">
              AIRSPACE FILTERS
            </div>

            <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer">
              <span>Flight Routes</span>
              <input
                type="checkbox"
                checked={layers.routes}
                onChange={e => setLayers({ ...layers, routes: e.target.checked })}
                className="accent-zinc-400"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer">
              <span>Aircraft Callsigns</span>
              <input
                type="checkbox"
                checked={layers.aircraft}
                onChange={e => setLayers({ ...layers, aircraft: e.target.checked })}
                className="accent-zinc-400"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer">
              <span>Doppler Weather</span>
              <input
                type="checkbox"
                checked={layers.weather}
                onChange={e => setLayers({ ...layers, weather: e.target.checked })}
                className="accent-zinc-400"
              />
            </label>

            <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer">
              <span>Airport Hubs</span>
              <input
                type="checkbox"
                checked={layers.airports}
                onChange={e => setLayers({ ...layers, airports: e.target.checked })}
                className="accent-zinc-400"
              />
            </label>
          </div>
        )}
      </div>

      {/* Bottom Right: Radar Doppler Legend */}
      {layers.weather && closureAirport && (
        <div className="absolute bottom-3 right-3 z-[1000] p-2.5 rounded bg-zinc-950/90 backdrop-blur-md border border-rose-900/40 text-xs font-mono-numbers space-y-1 shadow-lg">
          <div className="flex items-center space-x-1.5 text-rose-400 font-semibold text-[10px]">
            <CloudRain className="w-3.5 h-3.5" />
            <span>DOPPLER WEATHER RADAR</span>
          </div>
          <div className="flex items-center space-x-2 text-[9px] text-zinc-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Light</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Moderate</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Severe</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
