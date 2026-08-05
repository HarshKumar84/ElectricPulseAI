import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

import Navbar from "./components/Navbar";
import StatsOverview from "./components/StatsOverview";
import GridMap from "./components/GridMap";
import TicketList from "./components/TicketList";
import TicketDetailModal from "./components/TicketDetailModal";
import SimulatorPanel from "./components/SimulatorPanel";

import { DEMO_GRID_DATA, DEMO_TICKETS } from "./utils/demoData";

const API_BASE = "http://localhost:5000/api/v1";
const SOCKET_URL = "http://localhost:5000";

export default function App() {
  const [gridData, setGridData] = useState(DEMO_GRID_DATA);
  const [tickets, setTickets] = useState(DEMO_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchGridData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/grid/overview`, { timeout: 3000 });
      if (res.data.success && res.data.poles?.length > 0) {
        setGridData(res.data);
      }
    } catch (err) {
      console.log("Using Demo Grid Data (Backend offline or connecting)");
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tickets`, { timeout: 3000 });
      if (res.data.success && res.data.tickets) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.log("Using Demo Tickets (Backend offline or connecting)");
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchGridData(), fetchTickets()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();

    // Setup Socket.IO connection
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to ElectricPulse Socket Server");
      setSocketConnected(true);
      refreshAll();
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setSocketConnected(false);
    });

    socket.on("grid:updated", () => {
      fetchGridData();
    });

    socket.on("ticket:created", (newTicket) => {
      fetchTickets();
      fetchGridData();
    });

    socket.on("ticket:updated", (updatedTicket) => {
      fetchTickets();
      fetchGridData();
      if (selectedTicket && selectedTicket.ticket_id === updatedTicket.ticket_id) {
        setSelectedTicket(updatedTicket);
      }
    });

    socket.on("ticket:closed", () => {
      fetchTickets();
      fetchGridData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await axios.patch(`${API_BASE}/tickets/${ticketId}/status`, { status });
      fetchTickets();
    } catch (err) {
      // Local demo fallback
      setTickets(prev => prev.map(t => t.ticket_id === ticketId ? { ...t, status } : t));
    }
  };

  const handleTriggerRepair = async (ticketId) => {
    try {
      await axios.post(`${API_BASE}/simulator/trigger`, {
        type: "REPAIR",
        ticket_id: ticketId
      });
      fetchTickets();
      fetchGridData();
    } catch (err) {
      // Local demo repair
      setTickets(prev => prev.map(t => t.ticket_id === ticketId ? { ...t, status: "RESOLVED" } : t));
      setGridData(prev => ({
        ...prev,
        poles: prev.poles.map(p => ({ ...p, is_energized: true })),
        summary: { ...prev.summary, energized_poles: prev.summary.total_poles, dark_poles: 0 }
      }));
    }
    setSelectedTicket(null);
  };

  const handleSimulateFault = async (payload) => {
    try {
      await axios.post(`${API_BASE}/simulator/trigger`, payload);
      fetchTickets();
      fetchGridData();
    } catch (err) {
      // Local demo fault simulation
      if (payload.type === "SPAN_FAULT") {
        const targetId = payload.to_pole_id || "P-20103";
        setGridData(prev => ({
          ...prev,
          poles: prev.poles.map(p => p.pole_id >= targetId && p.transformer_id === payload.transformer_id ? { ...p, is_energized: false } : p),
          summary: { ...prev.summary, dark_poles: 8, energized_poles: 22 }
        }));
      }
    }
  };

  const activeFaultsCount = tickets.filter(t => ["DETECTED", "ACKNOWLEDGED", "CREW_ASSIGNED"].includes(t.status)).length;

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        socketConnected={socketConnected}
        onRefresh={refreshAll}
        activeFaultsCount={activeFaultsCount}
      />

      {/* Main Control Room Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 space-y-5">
        
        {/* Live Grid Metrics Bar */}
        <StatsOverview summary={gridData.summary} tickets={tickets} />

        {/* Core Layout: Grid Map + Control Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Interactive Map (7 cols) */}
          <div className="lg:col-span-7">
            <GridMap
              transformers={gridData.transformers || []}
              poles={gridData.poles || []}
              tickets={tickets}
              onSelectTicket={setSelectedTicket}
            />
          </div>

          {/* Right Column: Incident Tickets Feed (5 cols) */}
          <div className="lg:col-span-5">
            <TicketList
              tickets={tickets}
              onSelectTicket={setSelectedTicket}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>

        </div>

        {/* Embedded Simulator Panel */}
        <SimulatorPanel
          transformers={gridData.transformers || []}
          poles={gridData.poles || []}
          tickets={tickets}
          onSimulateFault={handleSimulateFault}
        />

      </main>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateStatus}
          onTriggerRepair={handleTriggerRepair}
        />
      )}
    </div>
  );
}
