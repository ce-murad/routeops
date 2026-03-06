# RouteOps — Vehicle Routing Optimizer

A full-stack vehicle routing optimization app. Upload delivery stops, configure your fleet, and get optimized routes solved with Google OR-Tools — visualized on an interactive map with real road geometry via OSRM.

**Live:** [routeops.vercel.app](https://routeops.vercel.app)

---

## Features

- **VRP Solver** — Google OR-Tools with Guided Local Search, supports up to 50 vehicles
- **Real road distances** — OSRM integration for accurate travel distance and time matrices, with haversine fallback
- **Interactive map** — Leaflet + OpenStreetMap with road-following polylines, numbered stop markers, and per-route focus
- **Two objectives** — Minimize total distance or minimize total travel time
- **CSV import/export** — Upload stops via CSV, export stops and solved routes
- **Manual entry** — Add and edit stops directly in the table
- **KPI dashboard** — Total distance, total time, routes used, stops served
- **Capacity warnings** — Real-time alert when total demand exceeds fleet capacity
- **Unserved stop detection** — Highlights stops that couldn't be assigned

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Mantine UI
- React Leaflet + Leaflet
- React Hook Form + Zod
- Axios
- Vite

### Backend
- FastAPI
- Google OR-Tools
- Pydantic v2
- OSRM (public API)
- Python 3.11+

---

## Project Structure

```
ie/
├── frontend/
│   └── src/
│       ├── pages/         # Dashboard, Landing
│       ├── components/    # MapView, Sidebar, KpiCard, RoutesTable, StopsTable, ...
│       ├── lib/           # api.ts, csv.ts, geo.ts, validators.ts
│       └── types/         # models.ts
└── backend/
    ├── main.py            # FastAPI app, CORS, endpoints
    └── solver.py          # OR-Tools VRP solver, OSRM integration
```

---

## Getting Started

### Backend

```bash
cd ie/backend
pip install fastapi uvicorn ortools requests pydantic
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd ie/frontend
npm install
```

Create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8000
```

Then run:

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## API

### `GET /health`
Returns `{ "status": "ok" }` if the backend is running.

### `POST /solve`
Solves the VRP and returns optimized routes.

**Request body:**
```json
{
  "stops": [
    { "id": "s1", "name": "Stop 1", "lat": 39.93, "lng": 32.85, "demand": 10 }
  ],
  "depotId": "s1",
  "vehicles": 3,
  "capacity": 100,
  "distanceMetric": "osrm",
  "objective": "distance"
}
```

**Response:**
```json
{
  "status": "ok",
  "summary": {
    "totalDistanceKm": 42.5,
    "totalTimeMin": 63.0,
    "routes": 3,
    "stopsServed": 15,
    "matrixUsed": "osrm",
    "objective": "distance"
  },
  "routes": [...],
  "unservedStopIds": []
}
```

---

## CSV Format

Stops CSV must have these headers:

```
id,name,lat,lng,demand
depot,Warehouse,39.9334,32.8597,0
s1,Customer A,39.91,32.84,15
```

---

## License

© 2025 Murad Abdullayev. All rights reserved.