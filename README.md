
# RouteOps — Vehicle Routing Optimizer

A full-stack vehicle routing optimization app. Upload delivery stops, configure your fleet, and get optimized routes solved with Google OR-Tools — visualized on an interactive map with real road geometry via OSRM.

**Live:** [routeops.vercel.app](https://routeops.vercel.app)

---

## Features

- **VRP Solver** — Google OR-Tools with Guided Local Search, supports up to 50 vehicles
- **Real road distances** — OSRM integration for road-network travel distance and time matrices, with Haversine fallback
- **Interactive map** — Leaflet + OpenStreetMap with road-following polylines, numbered stop markers, and per-route focus
- **Two objectives** — Minimize total distance or minimize total travel time
- **CSV import/export** — Upload stops via CSV, export stops and solved routes
- **Manual entry** — Add and edit stops directly in the table
- **KPI dashboard** — Total distance, total time, routes used, stops served
- **Capacity warnings** — Real-time alert when total demand exceeds fleet capacity
- **Unserved stop detection** — Highlights stops that couldn't be assigned

---

## Optimization Benchmark

RouteOps was evaluated against a capacity-feasible sequential-routing baseline across **10 reproducible synthetic delivery scenarios**, with 10–40 customers per scenario.

### Benchmark Results

| Metric | Result |
|---|---|
| Average fleet distance reduction | **54.2%** |
| Scenarios where RouteOps outperformed the baseline | **10/10** |
| Smallest distance reduction | 33.3% |
| Largest distance reduction | 66.4% |
| Median distance reduction | 58.2% |
| Optimization algorithm | Google OR-Tools — Guided Local Search |
| Evaluation metric | Total fleet travel distance |

### Results by Scenario Size

| Customers | Scenarios | Average Distance Reduction |
|---|---|---|
| 10 | 3 | 40.6% |
| 20 | 4 | 56.2% |
| 40 | 3 | 65.2% |
| **Overall** | **10** | **54.2%** |

### Methodology

The benchmark compares two routing approaches under identical scenario conditions:

1. **Sequential routing baseline:** Customers are assigned to vehicles in a predetermined order, respecting vehicle capacity constraints, without route optimization.
2. **RouteOps optimization:** The same delivery scenario is solved using Google OR-Tools with Guided Local Search.

Both approaches use the same depot, customer coordinates, vehicle capacities, demands, and distance matrix.

The benchmark uses:

- Synthetic delivery locations generated around Ankara, Türkiye
- Straight-line (Haversine) distance estimates
- Reproducible random scenario generation
- Vehicle capacity constraints
- Total fleet distance, including return trips to the depot

Percentage improvement is calculated as:

**Distance Reduction (%) = (Baseline Distance − RouteOps Distance) / Baseline Distance × 100**

The reported 54.2% represents the arithmetic mean of the percentage reductions across the 10 benchmark scenarios.

**Limitations:** These results demonstrate performance relative to the specified sequential-routing baseline on synthetic scenarios. They do not establish equivalent savings in actual road-network distance, fuel consumption, delivery costs, or real-world logistics operations. They also do not establish global optimality or superiority over other professional routing optimizers.

### Reproducing the Benchmark

The benchmark implementation and recorded results are available in:

- `backend/benchmark.py` — Scenario generation, baseline comparison, and optimization evaluation
- `backend/benchmark_results.csv` — Recorded results for the 10 scenarios

From the project backend directory:

```bash
cd ie/backend
python -m pip install -r requirements.txt
python benchmark.py
```

The script runs the benchmark scenarios and generates `benchmark_results.csv`.

The benchmark runs separately from the web application and does not require starting the frontend.

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

```text
ie/
├── frontend/
│   └── src/
│       ├── pages/         # Dashboard, Landing
│       ├── components/    # MapView, Sidebar, KpiCard, RoutesTable, StopsTable, ...
│       ├── lib/           # api.ts, csv.ts, geo.ts, validators.ts
│       └── types/         # models.ts
└── backend/
    ├── main.py                # FastAPI app, CORS, endpoints
    ├── solver.py              # OR-Tools VRP solver, OSRM integration
    ├── benchmark.py           # Reproducible optimization benchmark
    ├── benchmark_results.csv  # Benchmark results
    └── requirements.txt       # Python dependencies
```

---

## Getting Started

### Backend

```bash
cd ie/backend
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd ie/frontend
npm install
```

Create a `.env` file:

```env
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

```csv
id,name,lat,lng,demand
depot,Warehouse,39.9334,32.8597,0
s1,Customer A,39.91,32.84,15
```

---

## License

© 2025 Murad Abdullayev. All rights reserved.
