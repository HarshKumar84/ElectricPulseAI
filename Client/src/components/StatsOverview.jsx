import React from "react";
import { AlertOctagon, Zap, Shield, Home, Cpu } from "lucide-react";

export default function StatsOverview({ summary, tickets }) {
  const activeTickets = tickets.filter(t => ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED"].includes(t.status));
  const totalAffectedHouses = activeTickets.reduce((acc, t) => acc + (t.affected_houses || 0), 0);

  const stats = [
    {
      title: "Active Faults",
      value: activeTickets.length,
      unit: "Incidents",
      icon: AlertOctagon,
      color: activeTickets.length > 0 ? "text-red-400" : "text-emerald-400",
      bgColor: activeTickets.length > 0 ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30"
    },
    {
      title: "Dark Poles",
      value: summary?.dark_poles || 0,
      unit: `/ ${summary?.total_poles || 0} Poles`,
      icon: Zap,
      color: summary?.dark_poles > 0 ? "text-amber-400" : "text-emerald-400",
      bgColor: "bg-gray-800/50 border-gray-700/50"
    },
    {
      title: "Grid Energized",
      value: `${Math.round(((summary?.energized_poles || 0) / (summary?.total_poles || 1)) * 100)}%`,
      unit: `${summary?.energized_poles || 0} Poles Live`,
      icon: Shield,
      color: "text-cyan-400",
      bgColor: "bg-gray-800/50 border-gray-700/50"
    },
    {
      title: "Affected Houses",
      value: totalAffectedHouses,
      unit: "Consumers Dark",
      icon: Home,
      color: totalAffectedHouses > 0 ? "text-red-400" : "text-gray-400",
      bgColor: "bg-gray-800/50 border-gray-700/50"
    },
    {
      title: "IoT Sensor Nodes",
      value: summary?.active_sensors || 0,
      unit: "Online Sensors",
      icon: Cpu,
      color: "text-indigo-400",
      bgColor: "bg-gray-800/50 border-gray-700/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className={`glass-panel p-3.5 border rounded-xl flex items-center justify-between ${item.bgColor}`}>
            <div>
              <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">{item.title}</p>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className={`text-2xl font-bold font-heading ${item.color}`}>{item.value}</span>
                <span className="text-xs text-gray-400 font-mono">{item.unit}</span>
              </div>
            </div>
            <div className={`p-2.5 rounded-lg bg-gray-900/60 ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
