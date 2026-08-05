import React from "react";
import { X, MapPin, AlertTriangle, ShieldCheck, UserCheck, Wrench, Sparkles, CheckCircle2, Shield, Truck, HelpCircle } from "lucide-react";

export default function TicketDetailModal({ ticket, onClose, onUpdateStatus, onTriggerRepair }) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-3xl w-full rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-cyan-400">{ticket.ticket_id}</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded border border-red-500/30 uppercase tracking-wide">
                  {ticket.fault_type}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 uppercase">
                  {ticket.severity || 'HIGH'} SEVERITY
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1 font-heading">{ticket.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-gray-300">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-900/80 rounded-xl border border-gray-800">
              <p className="text-[10px] text-gray-400 font-mono">STATUS</p>
              <p className="text-xs font-bold text-cyan-400 mt-1 uppercase">{ticket.status}</p>
            </div>
            <div className="p-3 bg-gray-900/80 rounded-xl border border-gray-800">
              <p className="text-[10px] text-gray-400 font-mono">PINCODE</p>
              <p className="text-xs font-bold text-white mt-1 font-mono">{ticket.pincode}</p>
            </div>
            <div className="p-3 bg-gray-900/80 rounded-xl border border-gray-800">
              <p className="text-[10px] text-gray-400 font-mono">AFFECTED HOUSES</p>
              <p className="text-xs font-bold text-red-400 mt-1">{ticket.affected_houses} Consumers</p>
            </div>
            <div className="p-3 bg-gray-900/80 rounded-xl border border-gray-800">
              <p className="text-[10px] text-gray-400 font-mono">DARK POLES</p>
              <p className="text-xs font-bold text-amber-400 mt-1">{ticket.affected_poles?.length || 0} Poles</p>
            </div>
          </div>

          {/* Fault Boundary Details */}
          <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-gray-200 uppercase font-mono tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>Fault Localization & Boundary Breakdown</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="p-2.5 bg-gray-950/60 rounded-lg border border-gray-800/80">
                <span className="text-gray-500 block text-[10px]">LAST ENERGIZED POLE</span>
                <span className="text-emerald-400 font-bold text-sm">{ticket.from_pole_id || "Transformer Root"}</span>
              </div>
              <div className="p-2.5 bg-gray-950/60 rounded-lg border border-gray-800/80">
                <span className="text-gray-500 block text-[10px]">FIRST DARK POLE</span>
                <span className="text-red-400 font-bold text-sm">{ticket.to_pole_id || "End Pole"}</span>
              </div>
              <div>
                <span className="text-gray-500">Latitude: </span>
                <span className="text-gray-200">{ticket.lat}</span>
              </div>
              <div>
                <span className="text-gray-500">Longitude: </span>
                <span className="text-gray-200">{ticket.lng}</span>
              </div>
            </div>
          </div>

          {/* AI OPERATOR INCIDENT BRIEFING (4 STRUCTURED CARDS) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 font-heading">
              <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              <span>AI OPERATOR INCIDENT & DISPATCH BRIEFING</span>
            </div>

            {/* 1. Concise Summary */}
            <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-xl">
              <p className="text-xs text-gray-200 leading-relaxed font-sans">
                {ticket.ai_summary || "Automated graph localization identified line break between poles based on live/dark telemetry boundaries."}
              </p>
            </div>

            {/* 2. Probable Cause & Safety & Dispatch Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              
              {/* Probable Cause */}
              <div className="p-3 bg-gray-900/80 border border-amber-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                  <HelpCircle className="w-4 h-4" />
                  <span>Probable Causes</span>
                </div>
                <ul className="text-gray-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>Overhead line snapped by storm/tree collision</li>
                  <li>Insulator breakdown or cross-arm flashover</li>
                  <li>Thermal sag contact</li>
                </ul>
              </div>

              {/* Crew Safety Instructions */}
              <div className="p-3 bg-gray-900/80 border border-red-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-red-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Crew Safety Notes</span>
                </div>
                <ul className="text-gray-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>Verify 11kV de-energization with probe</li>
                  <li>Wear Class 2 insulated gloves (17kV)</li>
                  <li>Apply temporary earth ground clamps</li>
                </ul>
              </div>

              {/* Dispatch Equipment Checklist */}
              <div className="p-3 bg-gray-900/80 border border-emerald-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <Truck className="w-4 h-4" />
                  <span>Dispatch Gear</span>
                </div>
                <ul className="text-gray-300 text-[11px] space-y-1 list-disc list-inside">
                  <li>ACSR Conductor reel (50m)</li>
                  <li>Hydraulic crimper & line sleeves</li>
                  <li>Bucket truck & come-along hoist</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Affected Poles List */}
          <div>
            <p className="text-xs font-mono text-gray-400 mb-1.5">Affected Dark Poles ({ticket.affected_poles?.length || 0}):</p>
            <div className="flex flex-wrap gap-1.5">
              {ticket.affected_poles?.map(pid => (
                <span key={pid} className="px-2 py-1 bg-red-950/40 border border-red-800/40 text-red-300 text-[11px] font-mono rounded">
                  {pid}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/90 flex items-center justify-between">
          <div className="text-xs text-gray-400 font-mono">
            {ticket.status === "RESOLVED" && (
              <span className="text-purple-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 animate-spin" />
                <span>Auto-verifying telemetry restoration...</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {ticket.status === "DETECTED" && (
              <button
                onClick={() => onUpdateStatus(ticket.ticket_id, "ACKNOWLEDGED")}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-md"
              >
                <UserCheck className="w-4 h-4" />
                <span>Acknowledge</span>
              </button>
            )}

            {ticket.status === "ACKNOWLEDGED" && (
              <button
                onClick={() => onUpdateStatus(ticket.ticket_id, "CREW_ASSIGNED")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 shadow-md"
              >
                <Wrench className="w-4 h-4" />
                <span>Assign Field Crew</span>
              </button>
            )}

            {["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED"].includes(ticket.status) && (
              <button
                onClick={() => onTriggerRepair(ticket.ticket_id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Trigger Repair & Verify</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
