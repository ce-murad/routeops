# RouteOps – Vehicle Routing Optimizer

A production-quality React + TypeScript (Vite) web app for industrial vehicle routing: upload stops, set vehicle capacity, solve routes, and visualize on a map.

## Features

- **Landing page** – Hero, short description, CTA to app
- **App dashboard** – Sidebar (CSV upload / manual entry, problem settings, solve controls) + main content (KPIs, Leaflet map, routes table)
- **CSV upload** – Headers: `id,name,lat,lng,demand`; validation with Zod; preview and fix errors
- **Manual entry** – Add/edit/delete stops; “Add 5 sample stops” (Ankara area)
- **Solve** – POST `/solve` with AbortController; loading overlay; toasts and error handling
- **Map** – OpenStreetMap tiles; depot marker; numbered stop markers; colored polylines per route; popups with stop and route info
- **Export** – Stops to CSV; solved routes to CSV (per route)
- **Backend connectivity badge** – GET `/health`; “Backend: Online/Offline”
- **Unserved stops** – Warning banner when `unservedStopIds` is non-empty

## Tech stack

- React 18 + TypeScript + Vite
- React Router
- Mantine (UI)
- Leaflet / react-leaflet (OpenStreetMap)
- Axios, Zod, React Hook Form (+ @hookform/resolvers)

## Setup

### Install

```bash
npm install
```

### Environment

Create a `.env` file (or copy from `.env.example`):

```env
# Backend API base URL (no trailing slash).
# Omit or leave empty to run without a backend (UI only).
VITE_API_BASE_URL=http://localhost:8000
```

### Run

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

Output is in `dist/`. Preview with:

```bash
npm run preview
```

## Example CSV

Required headers: `id`, `name`, `lat`, `lng`, `demand`.

- `lat`: -90 to 90  
- `lng`: -180 to 180  
- `demand`: ≥ 0  
- `id`: unique

Example:

```csv
id,name,lat,lng,demand
s1,Store A,39.92,32.85,10
s2,Store B,39.94,32.86,15
s3,Store C,39.91,32.87,8
s4,Store D,39.93,32.84,12
s5,Store E,39.95,32.88,20
```

## API (backend)

- **GET /health** – Returns `{ "status": "ok" }`. Used for connectivity badge.
- **POST /solve** – Body: `SolveRequest` (stops, depotId, vehicles, capacity, distanceMetric, objective). Returns `SolveResponse` (status, summary, routes, unservedStopIds). Routes include `geometry` (polyline points).

The app works without a backend: you can load stops, edit settings, and use the map; Solve will fail with a friendly error if `VITE_API_BASE_URL` is not set or the backend is down.
