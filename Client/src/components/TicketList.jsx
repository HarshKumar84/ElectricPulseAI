import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Wrench, Clock, MapPin, ChevronRight, Eye } from "lucide-react";

export default function TicketList({ tickets, onSelectTicket, onUpdateStatus }) {
  const [filter, setFilter] = useState("ACTIVE");

  const filteredTickets = tickets.filter(t => {
    if (filter === "ACTIVE") return ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED"].includes(t.status);
    if (filter === "RESOLVED") return ["RESOLVED", "VERIFIED"].includes(t.status);
    if (filter === "CLOSED") return t.status === "CLOSED";
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "DETECTED":
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded pulse-fault-badge">DETECTED</span>;
      case "ACKNOWLEDGED":
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">ACKNOWLEDGED</span>;
      case "CREW_ASSIGNED":
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">CREW ASSIGNED</span>;
      case "RESOLVED":
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded">REPAIRED (PENDING VERIFICATION)</span>;
      case "VERIFIED":
      case "CLOSED":
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">VERIFIED & CLOSED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col h-[540px] border border-gray-800">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div>
          <h2 className="text-base font-bold font-heading text-white flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-cyan-400" />
            <span>Incident Ticket Control Feed</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono">Deduplicated Grid Fault Alerts</p>
        </div>

        <div className="flex space-x-1 bg-gray-900/80 p-1 rounded-lg border border-gray-800 text-xs">
          {["ACTIVE", "RESOLVED", "CLOSED", "ALL"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded font-medium transition ${filter === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
        {filteredTickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-2" />
            <p className="text-sm font-medium text-gray-400">No Incidents Found</p>
            <p className="text-xs text-gray-500 mt-1">Grid operating smoothly without active span or transformer faults.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div
              key={ticket.ticket_id}
              className="p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-blue-500/40 rounded-xl transition cursor-pointer group"
              onClick={() => onSelectTicket(ticket)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">{ticket.ticket_id}</span>
                  {getStatusBadge(ticket.status)}
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h3 className="text-xs font-bold text-white mt-1.5 group-hover:text-blue-300 transition">
                {ticket.title}
              </h3>

              {/* Location details */}
              <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-1.5 font-mono">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>PIN: {ticket.pincode}</span>
                </span>
                <span>•</span>
                <span>GPS: {ticket.lat.toFixed(5)}, {ticket.lng.toFixed(5)}</span>
              </div>

              {/* Affected houses & poles */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/60 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-red-400 font-semibold">{ticket.affected_houses} Houses Dark</span>
                  <span className="text-gray-400">({ticket.affected_poles?.length || 0} Poles Dark)</span>
                </div>

                <div className="flex items-center space-x-1 text-blue-400 text-[11px] font-medium group-hover:translate-x-0.5 transition">
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
