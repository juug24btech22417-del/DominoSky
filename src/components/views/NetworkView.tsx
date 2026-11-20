import React, { useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { AirspaceView } from '../globe/AirspaceView';
import { DATASET } from '../../engine/simulator';
import {
  Search,
  Plane,
  Building2
} from 'lucide-react';

export const NetworkView: React.FC = () => {
  const {
    activeOutput,
    selectedFlightId,
    selectFlight,
    closureAirport
  } = useSimulationStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'delayed' | 'cancelled' | 'ontime'>('all');

  const flightsList = Object.values(activeOutput.flights).filter(f => {
    const matchesSearch =
      f.flight_id.toLowerCase().includes(search.toLowerCase()) ||
      f.origin.toLowerCase().includes(search.toLowerCase()) ||
      f.destination.toLowerCase().includes(search.toLowerCase()) ||
      f.tail_id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'delayed') return f.dep_delay > 0 && !f.is_cancelled;
    if (statusFilter === 'cancelled') return f.is_cancelled;
    if (statusFilter === 'ontime') return f.dep_delay === 0 && !f.is_cancelled;
    return true;
  });

  return (
    <div className="flex-1 flex overflow-hidden bg-black select-none">
      {/* Left 60%: Photorealistic Airspace Radar Map */}
      <div className="flex-[3] relative border-r border-[#1A2230] flex flex-col">
        {/* Map Header Status Bar */}
        <div className="h-10 bg-[#0D121B] border-b border-[#1A2230] px-4 flex items-center justify-between text-xs font-mono-numbers">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-zinc-200">AIRSPACE RADAR // LIVE CONCURRENT FEED</span>
          </div>

          <div className="flex items-center space-x-3 text-zinc-400 text-[11px]">
            <span>10 HUBS MONITORED</span>
            <span>•</span>
            <span>RADAR SWEEP 60 FPS</span>
          </div>
        </div>

        {/* The Live Satellite Map */}
        <div className="flex-1 relative">
          <AirspaceView />
        </div>
      </div>

      {/* Right 40%: Airport Hub Congestion + Live Flight Schedule Feed */}
      <div className="flex-[2] bg-[#0A0D14] flex flex-col overflow-hidden divide-y divide-[#1A2230]">
        {/* Hub Status Strip */}
        <div className="p-3 bg-[#0D121B]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-bold text-zinc-300 font-mono-numbers flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>INDIAN AIRPORT HUBS STATUS</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono-numbers">REAL-TIME RUNWAY CAPACITY</span>
          </div>

          <div className="grid grid-cols-5 gap-2 font-mono-numbers text-xs">
            {DATASET.airports.slice(0, 5).map(ap => {
              const isClosed = ap.id === closureAirport;
              return (
                <div
                  key={ap.id}
                  className={`p-2 rounded-lg border text-center transition ${
                    isClosed
                      ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                      : 'bg-[#121824] border-[#1E2736] text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">{ap.id}</div>
                  <div className="text-[10px] text-zinc-400">{ap.city}</div>
                  <div className={`text-[9px] mt-1 font-semibold ${isClosed ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isClosed ? 'GROUND STOP' : 'NOMINAL'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Filter Bar & Search */}
        <div className="p-3 bg-[#0A0D14] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-[#121824] p-0.5 rounded-lg border border-[#1E2736] text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  statusFilter === 'all' ? 'bg-[#253043] text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All ({activeOutput.total_flights})
              </button>
              <button
                onClick={() => setStatusFilter('delayed')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  statusFilter === 'delayed' ? 'bg-[#401216] text-[#FF5555]' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Delayed ({activeOutput.delayed_flights_count})
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  statusFilter === 'cancelled' ? 'bg-rose-950 text-rose-300' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Cancelled ({activeOutput.cancelled_flights_count})
              </button>
              <button
                onClick={() => setStatusFilter('ontime')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  statusFilter === 'ontime' ? 'bg-emerald-950/80 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                On-Time
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by flight (DS0103), origin (BOM), tail (VT-IND)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#121824] border border-[#1E2736] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono-numbers"
            />
          </div>
        </div>

        {/* Live Flight Schedule Table */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#151D2A] text-xs font-mono-numbers">
          {flightsList.map(f => {
            const isSelected = selectedFlightId === f.flight_id;
            return (
              <div
                key={f.flight_id}
                onClick={() => selectFlight(f.flight_id)}
                className={`p-3 cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#182333] border-l-2 border-cyan-400'
                    : 'hover:bg-[#101622]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded bg-[#141A26] border border-[#232F42] flex items-center justify-center text-zinc-300">
                    <Plane className="w-3.5 h-3.5 text-cyan-400 transform -rotate-45" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <span>{f.flight_id}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">({f.tail_id})</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {f.origin} → {f.destination}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-zinc-200 font-semibold">
                    {f.actual_dep} → {f.actual_arr}
                  </div>
                  <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                    {f.is_cancelled ? (
                      <span className="text-[10px] text-rose-400 font-semibold px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800">
                        CANCELLED
                      </span>
                    ) : f.dep_delay > 0 ? (
                      <span className="text-[10px] text-[#FF5555] font-semibold px-1.5 py-0.5 rounded bg-[#401216] border border-[#6B1E24]">
                        +{f.dep_delay} min
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                        ON TIME
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
