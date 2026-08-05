import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

import Navbar from "./components/Navbar";
import StatsOverview from "./components/StatsOverview";
import GridMap from "./components/GridMap";
import TicketList from "./components/TicketList";
import TicketDetailModal from "./components/TicketDetailModal";
import SimulatorPanel from "./components/SimulatorPanel";
import EventTimeline from "./components/EventTimeline";

const API_BASE = "http://localhost:5000/api/v1";
const SOCKET_URL = "http://localhost:5000";

const EMPTY_GRID_DATA = {
  summary: {
    feeders_count: 0,
    transformers_count: 0,
    total_poles: 0,
    energized_poles: 0,
    dark_poles: 0,
    active_sensors: 0
  },
  feeders: [],
  transformers: [],
  poles: []
};

export default function App() {
  const [gridData, setGridData] = useState(EMPTY_GRID_DATA);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [telemetryEvents, setTelemetryEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGridData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/grid/overview`, { timeout: 3000 });
      if (res.data.success && res.data.summary) {
        setGridData(res.data);
      } else {
        setGridData(EMPTY_GRID_DATA);
      }
    } catch (err) {
      console.log("Database/Backend API disconnected or returning empty grid.");
      setGridData(EMPTY_GRID_DATA);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tickets`, { timeout: 3000 });
      if (res.data.success && res.data.tickets) {
        setTickets(res.data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.log("Database/Backend API disconnected or returning empty tickets.");
      setTickets([]);
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

    socket.on("telemetry:received", (data) => {
      setTelemetryEvents(prev => [
        {
          id: Date.now() + Math.random(),
          pole_id: data.pole_id,
          event: data.energized ? "power_restored" : "power_lost",
          energized: data.energized,
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 19)
      ]);
    });

    socket.on("ticket:created", () => {
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
      console.error("Error updating ticket status:", err);
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
      console.error("Error executing repair trigger:", err);
    }
    setSelectedTicket(null);
  };

  const handleSimulateFault = async (payload) => {
    try {
      await axios.post(`${API_BASE}/simulator/trigger`, payload);
      fetchTickets();
      fetchGridData();
    } catch (err) {
      console.error("Error executing simulation trigger:", err);
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
        <StatsOverview summary={gridData.summary || EMPTY_GRID_DATA.summary} tickets={tickets} />

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

        {/* Event Timeline Stream & Simulator Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6">
            <EventTimeline tickets={tickets} />
          </div>
          <div className="lg:col-span-6">
            <SimulatorPanel
              transformers={gridData.transformers || []}
              poles={gridData.poles || []}
              tickets={tickets}
              onSimulateFault={handleSimulateFault}
            />
          </div>
        </div>

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
