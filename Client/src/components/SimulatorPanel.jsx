import React, { useState } from "react";
import { Sliders, Zap, AlertTriangle, ShieldCheck, Play, RefreshCw, Layers, Cpu, Calendar, BellOff } from "lucide-react";

export default function SimulatorPanel({ transformers, poles, tickets, onSimulateFault }) {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="glass-panel border border-blue-500/30 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white font-heading">IoT Grid Fault Simulator</h3>
            <p className="text-xs text-gray-400 font-mono">Test Span Breaks, Dead Sensors, Heartbeat Timeouts, Planned Maintenance, or Auto-Repairs</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/40 transition flex items-center space-x-1"
        >
          <span>{isOpen ? "Collapse Simulator" : "Expand Simulator"}</span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in text-xs">
          
          {/* Fault Type Selector */}
          <div>
            <label className="block text-gray-400 font-mono mb-1">Simulation Test Scenario</label>
            <select
              value={faultType}
              onChange={e => setFaultType(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="SPAN_FAULT">⚡ Span Fault (Line Break)</option>
              <option value="DEAD_SENSOR">🔋 Dead IoT Sensor (Hardware Failure)</option>
              <option value="SILENT_SENSOR">🔕 Silent Sensor (Heartbeat Timeout &gt; 2 mins)</option>
              <option value="PLANNED_MAINTENANCE">📅 Planned Maintenance (10 AM - 12 PM Power Cut)</option>
              <option value="TRANSFORMER_FAULT">💥 Transformer Outage</option>
              <option value="FEEDER_FAULT">🔴 Feeder Tripping</option>
              <option value="REPAIR">🛠️ Repair Active Ticket</option>
            </select>
          </div>

          {/* Fault Specific Options */}
          {(faultType === "SPAN_FAULT" || faultType === "DEAD_SENSOR" || faultType === "SILENT_SENSOR") && (
            <>
              <div>
                <label className="block text-gray-400 font-mono mb-1">Select Transformer</label>
                <select
                  value={selectedDt}
                  onChange={e => setSelectedDt(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                >
                  {transformers.map(dt => (
                    <option key={dt.transformer_id} value={dt.transformer_id}>
                      {dt.name} ({dt.transformer_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-mono mb-1">Target Pole</label>
                <select
                  value={selectedPole}
                  onChange={e => setSelectedPole(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-blue-500 focus:outline-none"
                >
                  {filteredPoles.map(p => (
                    <option key={p.pole_id} value={p.pole_id}>
                      Pole {p.pole_id} (Parent: {p.parent_pole_id || 'DT Root'})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(faultType === "TRANSFORMER_FAULT" || faultType === "PLANNED_MAINTENANCE") && (
            <div>
              <label className="block text-gray-400 font-mono mb-1">Target Transformer</label>
              <select
                value={selectedDt}
                onChange={e => setSelectedDt(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-blue-500 focus:outline-none"
              >
                {transformers.map(dt => (
                  <option key={dt.transformer_id} value={dt.transformer_id}>
                    {dt.name} ({dt.transformer_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {faultType === "REPAIR" && (
            <div>
              <label className="block text-gray-400 font-mono mb-1">Active Ticket to Repair</label>
              <select
                value={selectedTicket}
                onChange={e => setSelectedTicket(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Select Active Ticket --</option>
                {activeTickets.map(t => (
                  <option key={t.ticket_id} value={t.ticket_id}>
                    {t.ticket_id} - {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Trigger Button */}
          <div className="flex items-end">
            <button
              onClick={handleRunSimulation}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg transition shadow-lg flex items-center justify-center space-x-2"
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
