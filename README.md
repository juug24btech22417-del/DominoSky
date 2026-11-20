# DOMINO SKY — Network Operations Intelligence

> **One disruption. A thousand consequences.**

Domino Sky is an enterprise-grade Aviation Disruption Simulation & AI Recovery Command Center. It models the cascading ripple effect of airport ground stops across coupled networks: **Aircraft Tail Rotations**, **Crew Flight Duty Time Limitations (DGCA FDTL)**, and **Passenger Connection Itineraries**.

Built with a **100% deterministic graph engine** ensuring that every delay minute, stranded passenger count, and financial penalty is mathematically verified with zero AI hallucination.

---

## 🌟 Key Features

### 1. Aerospace Command Center (Billion-Dollar Aesthetic)
- **Cinematic 3D Airspace Globe:** Three.js orbital globe showing the 16 Indian airport hubs, curved geodesic flight arcs, and active aircraft pins cruising in real time.
- **2D Tactical Radar Mode:** Instant 1-click fallback to a high-performance 2D Canvas radar map.
- **Doppler Radar Storm Cell:** Dynamic weather radar alert pulsing over closed airports.
- **Live Disruption P&L Exposure:** Quantifies financial impact in Rupees (₹ Lakhs/Crores) covering DGCA CAR Section 3 passenger compensation, crew overtime, and fuel/handling costs.

### 2. Deterministic Ripple Simulation Engine (<20ms in TypeScript)
- **Aircraft Rotation Tracking:** Evaluates 16 aircraft tail chains with 30-minute turnaround buffer constraints.
- **Passenger Connections:** Tracks 21 passenger connection banks; detects broken connections based on Minimum Connection Times (MCT).
- **Crew Legality (FDTL):** Enforces 600-minute maximum duty caps; flags legal violations.
- **Zero Hallucination:** All metrics originate from deterministic code; AI acts strictly as an operational strategist.

### 3. Domino DNA (Causal Root-Cause Inspector)
- Click any delayed flight to see its complete mathematical breadcrumb trail answering:
  *Why is a flight delayed 5 hours later when both its origin and destination have clear skies?*

### 4. AI Recovery Lab (Before vs. After Diff)
- Generates and evaluates feasible candidate recovery interventions:
  - **Option 1 (Schedule Integrity):** Injects reserve aircraft `VT-DS17` at Bengaluru (BLR).
  - **Option 2 (Passenger First):** Injects mega-hub reserve `VT-DS18` at Delhi (DEL).
  - **Option 3 (Cost Minimizer):** Strategic circuit-breaker flight cancellation to protect evening hub waves.
- Live side-by-side comparison table showing delay minutes saved, passengers rescued, and crores in financial loss prevented.

### 5. Interactive Time Machine & Judge Tour Mode
- **Time Scrubber:** Scrub from `05:00` to `23:59` IST with variable playback speeds (`1x`, `5x`, `15x`, `60x`).
- **Judge Demonstration Tour:** A 1-click guided 5-step walkthrough specifically tailored for hackathon judges to experience the shock, cascade, causal chain, and recovery in under 90 seconds.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository and navigate into DominoSky
cd DominoSky

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📦 Production Build & Deployment

Domino Sky is **100% deployment-compatible** with zero backend server dependencies (pure client-side deterministic simulation):

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Deploying to Vercel / Netlify / Cloudflare Pages
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

---

## 📊 Dataset Specifications
- **Airports (16):** DEL, BOM, BLR, HYD, MAA, CCU, AMD, COK, GOI, PNQ, JAI, GAU, LKO, IXC, BBI, TRV
- **Flights (70):** DS0101 through DS1604 across 16 aircraft rotations (`VT-DS01` to `VT-DS16`)
- **Connections (21):** CX01 through CX21
- **Crew Groups (16):** CR01 through CR16 with 600m max duty limits
- **Standby Aircraft (2):** `VT-DS17` (BLR Base) & `VT-DS18` (DEL Base)
