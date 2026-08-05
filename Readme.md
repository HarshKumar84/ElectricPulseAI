# ⚡ ElectricPulse AI — Automated Grid Fault Localization & Control Room System

**ElectricPulse AI** is an automated IoT-driven electrical grid fault localization system. It ingests binary telemetry (`energized: true/false`) from pole-mounted IoT sensors, localizes overhead line breaks down to the exact span between $P_{\text{live}}$ (Last Live Pole) and $P_{\text{dead}}$ (First Dark Pole), deduplicates cascading alerts into single incident tickets, and auto-verifies physical power restoration.

---

## 🚀 Key System Features

- 📍 **Deterministic Fault Localization**: Pinpoints physical line breaks ($P_{\text{live}} \rightarrow P_{\text{dead}}$) across radial tree structures within seconds.
- ⚡ **Missing Topology Inference**: Reconstructs missing parent-child links for poles lacking explicit topology data using Euclidean spatial distance ordering (rendered as **Dashed Cyan Lines**).
- 🎯 **Incident Alert Deduplication**: Suppresses cascading alerts; groups 50+ dark poles into **1 Master Incident Ticket** per physical fault.
- 🔋 **Dead Sensor vs. Broken Wire (Problem 1)**: Identifies single dark poles reporting dark while downstream poles are live $\rightarrow$ Issues a `DEAD_SENSOR` hardware alert instead of an emergency outage ticket.
- 📅 **Planned Government Outage (Problem 2)**: Checks maintenance schedules before creating tickets $\rightarrow$ Marks poles as `PLANNED_OUTAGE` (Purple) and suppresses emergency alerts.
- 🔕 **Silent Sensors / Heartbeat Timeout (Problem 3)**: Background service flags sensors missing heartbeats > 2 mins as `OFFLINE` (Amber).
- 🤖 **AI Operator Briefings**: Produces concise incident summaries, probable physical causes (e.g. tree branch fall, insulator flashover), field crew safety instructions, and dispatch checklists.
- 🎮 **IoT Grid Fault Simulator**: Control panel to inject line breaks, dead sensors, heartbeat timeouts, planned outages, or trigger repairs.
- 🗺️ **React Leaflet + OpenStreetMap**: 100% free, zero-API-key interactive control room grid map.

---

## 🎨 Grid Map Color Legend

| Indicator | Color Code | Grid Condition |
| :--- | :---: | :--- |
| **Live Pole / Energized Line** | 🟢 Green (`#10b981`) | Normal power flow across healthy poles & spans. |
| **Dark Pole / Span Break** | 🔴 Red (`#ef4444`) | Power lost downstream from physical wire break or transformer trip. |
| **Planned Outage** | 🟣 Purple (`#a855f7`) | Power intentionally cut for scheduled government maintenance. |
| **Silent / Dead Sensor** | 🟡 Amber (`#f59e0b`) | IoT sensor hardware/battery failure or missing heartbeat > 2 mins. |
| **Inferred Topology Link** | 🌐 Dashed Cyan | Automatically reconstructed spatial connection for unlinked poles. |

---

## 🛠️ Technology Stack

- **Frontend**: React + Vite + Tailwind CSS + React Leaflet + Socket.IO Client + Lucide Icons
- **Backend**: Node.js + Express + Mongoose + Socket.IO WebSockets
- **Database**: MongoDB Atlas / Local MongoDB
- **Containerization**: Docker & Docker Compose (Nginx Alpine + Node 20 Alpine)

---

## 📦 Docker Container Setup (Recommended)

To run the complete system (MongoDB, Express Backend, and React Nginx Frontend) in Docker:

```bash
docker compose up --build
```

### Active Docker Endpoints:
- 💻 **Frontend Control Room**: `http://localhost:3000`
- ⚙️ **Backend API**: `http://localhost:5000`
- 🗄️ **MongoDB Service**: `mongodb://localhost:27017`

---

## ⚙️ Manual Local Development Setup

### 1. Start Backend Server
```bash
cd Server
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Start Frontend App
```bash
cd Client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/grid/overview` | Returns live grid state, statistics, transformers, and poles. |
| `POST` | `/api/v1/telemetry` | Ingests IoT binary sensor signals (`pole_id`, `energized: true/false`). |
| `GET` | `/api/v1/tickets` | Returns active and closed incident tickets. |
| `PATCH`| `/api/v1/tickets/:id/status` | Updates ticket lifecycle status (`ACKNOWLEDGED`, `CREW_ASSIGNED`, `RESOLVED`, `CLOSED`). |
| `POST` | `/api/v1/simulator/trigger` | Triggers simulator fault scenarios (`SPAN_FAULT`, `DEAD_SENSOR`, `SILENT_SENSOR`, `PLANNED_MAINTENANCE`, `REPAIR`). |
