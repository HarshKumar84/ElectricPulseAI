import React from "react";
import { Zap, Activity, ShieldAlert, Cpu, RefreshCw } from "lucide-react";

export default function Navbar({ socketConnected, onRefresh, activeFaultsCount }) {
  return (
    <header className="glass-panel border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/40 text-blue-400">
          <Zap className="w-6 h-6 animate-pulse text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-heading bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            ElectricPulse AI
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            Smart Electrical Grid Fault Localization & Control Room
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Active Fault Alert Badge */}
        {activeFaultsCount > 0 ? (
          <div className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-full flex items-center space-x-2 pulse-fault-badge text-red-400 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>{activeFaultsCount} ACTIVE FAULT(S) DETECTED</span>
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
            <Activity className="w-4 h-4" />
            <span>GRID OPERATIONAL</span>
          </div>
        )}

        {/* WebSocket Connection Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900/60 border border-gray-800 rounded-lg text-xs font-mono">
          <Cpu className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Socket:</span>
          {socketConnected ? (
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
              <span>Connected</span>
            </span>
          ) : (
            <span className="text-amber-400">Disconnected (Polling)</span>
          )}
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition flex items-center text-xs space-x-1"
          title="Refresh Grid Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
