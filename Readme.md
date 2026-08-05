# ⚡ ElectricPulse AI — Electrical Grid Fault Localization & Control Room System

ElectricPulse AI is an automated IoT-driven electrical grid fault localization system. It ingests binary telemetry (`energized: true/false`) from pole-mounted IoT sensors, localizes overhead line breaks down to the exact span between $P_{\text{live}}$ (Last Live Pole) and $P_{\text{dead}}$ (First Dark Pole), deduplicates cascading alerts into single incident tickets, and auto-verifies physical power restoration.

---

## 🚀 Features

- 📍 **Live/Dark Boundary Localization**: Deterministic graph search to pinpoint physical line breaks ($P_{\text{live}} \rightarrow P_{\text{dead}}$) within seconds.
- ⚡ **Missing Topology Recovery**: Reconstructs missing topology for the ~60% of poles lacking explicit link metadata using spatial proximity & distance ordering.
- 🎯 **Incident Alert Deduplication**: Groups 50+ dark poles into **1 master incident ticket** per physical fault.
- 🔋 **Dead Sensor Detection**: Distinguishes hardware battery failure (`DEAD_SENSOR`) from high-voltage wire breaks (`SPAN_FAULT`).
- 📅 **Planned Maintenance Interceptor**: Suppresses emergency alerts during scheduled government power outages (`PLANNED_OUTAGE`).
- 🤖 **AI Incident Briefings**: Structured operator briefs with probable causes, field crew safety notes, and dispatch checklists.
- 🎮 **Real-time Grid Simulator**: Interactive control panel to inject span breaks, dead sensors, heartbeat timeouts, or trigger repairs.
- 🗺️ **React Leaflet + OpenStreetMap**: 100% free, zero-API-key interactive 2D grid map.

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS v4 + React Leaflet + Socket.IO Client
- **Backend**: Node.js + Express + Mongoose + Socket.IO
- **Database**: MongoDB Atlas (with Resilient Embedded Memory DB Fallback)

---

## ⚙️ Quick Start

### 1. Backend Setup
```bash
cd Server
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd Client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*
