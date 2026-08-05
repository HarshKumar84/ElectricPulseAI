import React from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Marker } from "react-leaflet";
import L from "leaflet";

// Custom Leaflet Icons using DivIcon for dark theme styling
const transformerIcon = new L.DivIcon({
  className: "custom-transformer-icon",
  html: `<div style="background: #3b82f6; width: 28px; height: 28px; border-radius: 8px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(59,130,246,0.9); font-weight: bold; color: white; font-size: 14px;">⚡</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const brokenSpanIcon = new L.DivIcon({
  className: "custom-broken-icon",
  html: `<div style="background: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(239,68,68,0.95); font-weight: bold; color: white; font-size: 15px;" class="pulse-fault-badge">❌</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

export default function GridMap({ transformers, poles, tickets, onSelectTicket }) {
  const center = [12.968214, 77.594612];

  const poleMap = new Map(poles.map(p => [p.pole_id, p]));

  // Build line segments between parents and downstream poles
  const lineSegments = [];
  poles.forEach(pole => {
    if (pole.parent_pole_id) {
      const parent = poleMap.get(pole.parent_pole_id);
      if (parent) {
        const isBroken = parent.is_energized && !pole.is_energized && pole.sensor_status !== "PLANNED_OUTAGE";
        const isMaintenance = pole.sensor_status === "PLANNED_OUTAGE";
        const isTopologyInferred = pole.is_topology_inferred || parent.is_topology_inferred;
        const bothEnergized = parent.is_energized && pole.is_energized;

        lineSegments.push({
          id: `${parent.pole_id}-${pole.pole_id}`,
          positions: [
            [parent.location.lat, parent.location.lng],
            [pole.location.lat, pole.location.lng]
          ],
          isBroken,
          isMaintenance,
          isTopologyInferred,
          bothEnergized,
          from: parent,
          to: pole
        });
      }
    }
  });

  // Active tickets for broken wire overlay markers
  const activeTickets = tickets.filter(t => ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED"].includes(t.status));

  return (
    <div className="glass-panel p-2 rounded-xl relative overflow-hidden h-[560px] border border-gray-800 shadow-2xl">
      
      {/* Map Control Legend Overlay */}
      <div className="absolute top-4 right-4 z-[400] bg-gray-900/90 backdrop-blur-md p-3 rounded-xl border border-gray-800 text-[11px] font-mono space-y-1.5 shadow-xl">
        <p className="font-bold text-gray-200 text-xs font-heading mb-1 border-b border-gray-800 pb-1">⚡ Grid Topology Legend</p>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#10b981]"></span>
          <span className="text-gray-300">Live Pole / Energized Line</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_6px_#ef4444]"></span>
          <span className="text-gray-300">Dark Pole / Span Break</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
          <span className="text-gray-300">Planned Government Outage</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
          <span className="text-gray-300">Silent Sensor (Heartbeat Timeout)</span>
        </div>
        <div className="flex items-center space-x-2 pt-1 border-t border-gray-800 text-[10px]">
          <span className="w-4 border-b-2 border-dashed border-cyan-400 inline-block"></span>
          <span className="text-cyan-300">Inferred Topology (60% Missing Data)</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "10px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Draw Power Lines */}
        {lineSegments.map(seg => {
          let lineColor = "#06b6d4"; // Default cyan
          if (seg.isBroken) lineColor = "#ef4444";
          else if (seg.isMaintenance) lineColor = "#8b5cf6";
          else if (seg.isTopologyInferred) lineColor = "#38bdf8";

          return (
            <Polyline
              key={seg.id}
              positions={seg.positions}
              pathOptions={{
                color: lineColor,
                weight: seg.isBroken ? 4 : 2.5,
                dashArray: seg.isBroken ? "8, 8" : seg.isTopologyInferred ? "6, 6" : null,
                opacity: 0.85
              }}
            >
              <Popup>
                <div className="p-1 font-mono text-xs">
                  <p className="font-bold text-cyan-400">Span: {seg.from.pole_id} ➔ {seg.to.pole_id}</p>
                  {seg.isTopologyInferred && (
                    <p className="text-[10px] text-amber-300 mt-0.5">
                      ⚡ Inferred Topology Link (Spatial Distance Graph)
                    </p>
                  )}
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 2. Draw Transformers */}
        {transformers.map(dt => (
          <Marker
            key={dt.transformer_id}
            position={[dt.location.lat, dt.location.lng]}
            icon={transformerIcon}
          >
            <Popup>
              <div className="p-1 font-sans">
                <h4 className="font-bold text-sm text-blue-400 font-heading">{dt.name}</h4>
                <p className="text-xs text-gray-300 font-mono">ID: {dt.transformer_id}</p>
                <p className="text-xs text-gray-400">PIN Code: {dt.pincode}</p>
                <p className="text-xs text-gray-400">Capacity: {dt.capacity_kva} kVA</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] rounded font-bold ${dt.is_energized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {dt.is_energized ? "ONLINE & ENERGIZED" : "TRANSFORMER OUTAGE"}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Draw Electric Poles */}
        {poles.map(pole => {
          let fillColor = "#10b981"; // Live Green
          if (!pole.is_energized) fillColor = "#ef4444"; // Dark Red
          if (pole.sensor_status === "OFFLINE") fillColor = "#f59e0b"; // Silent Sensor Amber
          if (pole.sensor_status === "PLANNED_OUTAGE") fillColor = "#8b5cf6"; // Planned Maintenance Purple

          return (
            <CircleMarker
              key={pole.pole_id}
              center={[pole.location.lat, pole.location.lng]}
              radius={pole.is_energized ? 6 : 8}
              pathOptions={{
                color: pole.is_topology_inferred ? "#38bdf8" : "#ffffff",
                weight: pole.is_topology_inferred ? 2 : 1.5,
                fillColor: fillColor,
                fillOpacity: 0.95
              }}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm font-mono text-cyan-400">{pole.pole_id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      pole.sensor_status === 'PLANNED_OUTAGE' 
                        ? 'bg-purple-500/30 text-purple-300' 
                        : pole.sensor_status === 'OFFLINE'
                        ? 'bg-amber-500/30 text-amber-300'
                        : pole.is_energized 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {pole.sensor_status === 'PLANNED_OUTAGE' 
                        ? 'PLANNED OUTAGE' 
                        : pole.sensor_status === 'OFFLINE'
                        ? 'SILENT SENSOR'
                        : pole.is_energized ? 'LIVE' : 'DARK'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1 space-y-0.5">
                    <p>DT: <span className="font-mono text-gray-200">{pole.transformer_id}</span></p>
                    <p>Parent: <span className="font-mono text-gray-200">{pole.parent_pole_id || "Transformer Root"}</span></p>
                    {pole.is_topology_inferred && (
                      <p className="text-[10px] text-amber-400 font-mono">⚡ Spatial Topology Inferred</p>
                    )}
                    <p>Houses Connected: <span className="font-semibold text-white">{pole.house_count}</span></p>
                    <p>PIN: <span className="font-mono text-gray-400">{pole.pincode}</span></p>
                    <p className="text-[10px] text-gray-400">GPS: {pole.location.lat.toFixed(5)}, {pole.location.lng.toFixed(5)}</p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 4. Draw Active Fault Markers */}
        {activeTickets.map(ticket => (
          <Marker
            key={ticket.ticket_id}
            position={[ticket.lat, ticket.lng]}
            icon={brokenSpanIcon}
            eventHandlers={{
              click: () => onSelectTicket(ticket)
            }}
          >
            <Popup>
              <div className="p-1">
                <span className="text-[10px] bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded font-bold uppercase">
                  {ticket.fault_type}
                </span>
                <h4 className="font-bold text-xs text-red-400 mt-1">{ticket.title}</h4>
                <p className="text-[11px] text-gray-300 mt-0.5 font-mono">{ticket.ticket_id}</p>
                <p className="text-[11px] text-gray-400">PIN: {ticket.pincode}</p>
                <button
                  onClick={() => onSelectTicket(ticket)}
                  className="mt-2 w-full text-xs py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition"
                >
                  Inspect Incident
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
