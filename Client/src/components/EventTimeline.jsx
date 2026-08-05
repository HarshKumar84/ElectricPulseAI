import React from "react";
import { Activity, Radio, AlertTriangle, CheckCircle2, Clock, ShieldAlert, Wrench } from "lucide-react";

export default function EventTimeline({ tickets = [] }) {
  // Only show active incidents currently requiring attention (DETECTED, ACKNOWLEDGED, CREW_ASSIGNED)
  // Once verified/resolved/closed, they are automatically removed from this live box
  const activeIncidents = tickets.filter(t => 
    ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED"].includes(t.status)
  );

  return (
    <div className="glass-panel p-4 rounded-xl border border-gray-800 h-[260px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-800 mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-white font-heading tracking-wide">
              ⚡ Active Grid Incidents Stream
            </h3>
            <p className="text-[11px] text-gray-400 font-mono">
              Unverified Live Outages & Fault Alerts
            </p>
          </div>
        </div>
        
        <span className={`px-2.5 py-1 text-[10px] font-mono rounded border flex items-center space-x-1.5 ${
          activeIncidents.length > 0 
            ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse" 
            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        }`}>
          <Radio className={`w-3 h-3 ${activeIncidents.length > 0 ? "animate-ping text-red-400" : "text-emerald-400"}`} />
          <span>{activeIncidents.length > 0 ? `${activeIncidents.length} UNVERIFIED FAULT(S)` : "GRID NORMAL"}</span>
        </span>
      </div>

      {/* Stream List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
        {activeIncidents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 rounded-lg bg-gray-900/40 border border-dashed border-gray-800 text-gray-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
            <p className="text-xs font-bold text-gray-200">No Unverified Active Incidents</p>
            <p className="text-[11px] text-gray-500 mt-0.5">All grid poles reporting live. Incidents clear automatically upon verification.</p>
          </div>
        ) : (
          activeIncidents.map((t) => (
            <div
              key={t.ticket_id}
              className="p-3 rounded-xl bg-red-950/30 border border-red-800/50 text-red-200 flex flex-col space-y-1.5 shadow-lg transition animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
                  <span className="font-bold text-white text-xs">{t.ticket_id}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/30 text-red-300 rounded border border-red-500/40 uppercase">
                    {t.fault_type}
                  </span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase flex items-center space-x-1">
                  <Wrench className="w-3 h-3" />
                  <span>{t.status.replace("_", " ")}</span>
                </span>
              </div>

              <p className="text-[11px] text-gray-300 leading-tight font-sans font-medium">
                {t.title}
              </p>

              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-red-900/40">
                <span>Dark Poles: <strong className="text-red-400">{t.affected_poles?.length || 0} Poles</strong></span>
                <span>Affected Houses: <strong className="text-amber-400">{t.affected_houses || 0}</strong></span>
                <span className="flex items-center space-x-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{t.createdAt ? new Date(t.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
