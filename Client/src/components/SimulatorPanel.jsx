import React, { useState } from "react";
import { Sliders, Play, ChevronDown, ChevronUp, AlertCircle, Wrench, ShieldAlert, Radio, Activity, CheckCircle } from "lucide-react";

export default function SimulatorPanel({ transformers = [], poles = [], tickets = [], onSimulateFault }) {
  const [isOpen, setIsOpen] = useState(true);
  const [faultType, setFaultType] = useState("SPAN_FAULT");
  const [selectedDt, setSelectedDt] = useState(transformers[0]?.transformer_id || "DT-201");
  const [selectedPole, setSelectedPole] = useState("P-20103");
  const [selectedTicket, setSelectedTicket] = useState("");

  const filteredPoles = poles.filter(p => p.transformer_id === selectedDt);
  const activeTickets = tickets.filter(t => ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED"].includes(t.status));

  const handleRunSimulation = () => {
    if (faultType === "SPAN_FAULT") {
      const target = poles.find(p => p.pole_id === selectedPole);
      onSimulateFault({
        type: "SPAN_FAULT",
        from_pole_id: target?.parent_pole_id || "DT Root",
        to_pole_id: selectedPole,
        transformer_id: selectedDt
      });
    } else if (faultType === "DEAD_SENSOR") {
      onSimulateFault({
        type: "DEAD_SENSOR",
        pole_id: selectedPole,
        transformer_id: selectedDt
      });
    } else if (faultType === "SILENT_SENSOR") {
      onSimulateFault({
        type: "SILENT_SENSOR",
        pole_id: selectedPole,
        transformer_id: selectedDt
      });
    } else if (faultType === "PLANNED_MAINTENANCE") {
      onSimulateFault({
        type: "PLANNED_MAINTENANCE",
        transformer_id: selectedDt,
        title: `Scheduled Maintenance at ${selectedDt} (10:00 AM - 12:00 PM)`,
        reason: "Overhead conductor upgrade & insulation servicing"
      });
    } else if (faultType === "TRANSFORMER_FAULT") {
      onSimulateFault({
        type: "TRANSFORMER_FAULT",
        transformer_id: selectedDt
      });
    } else if (faultType === "FEEDER_FAULT") {
      onSimulateFault({
        type: "FEEDER_FAULT",
        feeder_id: "FDR-101"
      });
    } else if (faultType === "REPAIR") {
      if (selectedTicket) {
        onSimulateFault({
          type: "REPAIR",
          ticket_id: selectedTicket
        });
      }
    }
  };

  return (
    <div className="glass-panel border border-cyan-500/30 rounded-xl p-4 md:p-5 shadow-2xl transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-heading tracking-wide flex items-center space-x-2">
              <span>🎮 IoT Grid Fault Simulator</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 uppercase">
                TEST BED
              </span>
            </h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Simulate line breaks, dead sensors, heartbeat timeouts, planned outages, or crew repairs
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold rounded-lg border border-gray-700 transition flex items-center space-x-1.5"
        >
          <span>{isOpen ? "Collapse Simulator" : "Expand Simulator"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Controls Body */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-4 animate-fade-in">
          
          {/* Main Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            
            {/* 1. Fault Scenario Type */}
            <div className="space-y-1.5">
              <label className="block text-gray-300 font-bold flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulation Test Scenario</span>
              </label>
              <select
                value={faultType}
                onChange={e => setFaultType(e.target.value)}
                className="w-full bg-gray-900/90 border border-gray-700/80 text-white rounded-lg p-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-inner"
              >
                <option value="SPAN_FAULT">⚡ Span Fault (Line Break)</option>
                <option value="DEAD_SENSOR">🔋 Dead IoT Sensor (Battery/Hardware)</option>
                <option value="SILENT_SENSOR">🔕 Silent Sensor (&gt;2 min Heartbeat Timeout)</option>
                <option value="PLANNED_MAINTENANCE">📅 Planned Maintenance (Govt Cut 10 AM-12 PM)</option>
                <option value="TRANSFORMER_FAULT">💥 Transformer Outage (DT Trip)</option>
                <option value="FEEDER_FAULT">🔴 Feeder Tripping (11kV Main Line)</option>
                <option value="REPAIR">🛠️ Repair & Verify Active Ticket</option>
              </select>
            </div>

            {/* 2. Primary Target Selection */}
            {(faultType === "SPAN_FAULT" || faultType === "DEAD_SENSOR" || faultType === "SILENT_SENSOR" || faultType === "TRANSFORMER_FAULT" || faultType === "PLANNED_MAINTENANCE") && (
              <div className="space-y-1.5">
                <label className="block text-gray-300 font-bold flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span>Select Transformer (Substation)</span>
                </label>
                <select
                  value={selectedDt}
                  onChange={e => setSelectedDt(e.target.value)}
                  className="w-full bg-gray-900/90 border border-gray-700/80 text-white rounded-lg p-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-inner"
                >
                  {transformers.map(dt => (
                    <option key={dt.transformer_id} value={dt.transformer_id}>
                      {dt.name} ({dt.transformer_id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Secondary Target Selection (Pole or Ticket) */}
            {(faultType === "SPAN_FAULT" || faultType === "DEAD_SENSOR" || faultType === "SILENT_SENSOR") && (
              <div className="space-y-1.5">
                <label className="block text-gray-300 font-bold flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Electric Pole</span>
                </label>
                <select
                  value={selectedPole}
                  onChange={e => setSelectedPole(e.target.value)}
                  className="w-full bg-gray-900/90 border border-gray-700/80 text-white rounded-lg p-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-inner"
                >
                  {filteredPoles.map(p => (
                    <option key={p.pole_id} value={p.pole_id}>
                      Pole {p.pole_id} (Parent: {p.parent_pole_id || 'DT Root'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {faultType === "REPAIR" && (
              <div className="space-y-1.5 col-span-2">
                <label className="block text-gray-300 font-bold flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Active Ticket to Repair & Verify</span>
                </label>
                <select
                  value={selectedTicket}
                  onChange={e => setSelectedTicket(e.target.value)}
                  className="w-full bg-gray-900/90 border border-gray-700/80 text-white rounded-lg p-2.5 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none shadow-inner"
                >
                  <option value="">-- Select Active Fault Ticket --</option>
                  {activeTickets.map(t => (
                    <option key={t.ticket_id} value={t.ticket_id}>
                      {t.ticket_id} - {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {/* Action Row & Execute Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-800/60">
            <div className="text-[11px] font-mono text-gray-400 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {faultType === "SPAN_FAULT" && "Cuts wire down stream from parent pole. Triggers Live/Dark boundary fault localization."}
                {faultType === "DEAD_SENSOR" && "Single dark pole reporting dark while downstream is live. Generates DEAD_SENSOR ticket."}
                {faultType === "SILENT_SENSOR" && "Simulates missing heartbeats for 2+ mins. Flags sensor state as OFFLINE."}
                {faultType === "PLANNED_MAINTENANCE" && "Registers 10:00 AM maintenance cut. Suppresses emergency tickets & marks PLANNED_OUTAGE."}
                {faultType === "TRANSFORMER_FAULT" && "Cuts all power under transformer. Generates TRANSFORMER_FAULT incident ticket."}
                {faultType === "FEEDER_FAULT" && "Trips 11kV feeder line, darkening all connected transformers and poles."}
                {faultType === "REPAIR" && "Dispatches virtual repair crew and verifies telemetry restoration before closing ticket."}
              </span>
            </div>

            <button
              onClick={handleRunSimulation}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Execute Simulation Trigger</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
