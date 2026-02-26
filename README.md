RouteOps – Vehicle Routing Optimizer
A React + Vite frontend and FastAPI + OR-Tools backend for solving and visualizing complex vehicle routing problems (VRP).

## Features
Interactive Web UI – Upload or manually manage stops, configure vehicles and capacity, then solve and inspect routes.

CSV Workflow – Import and export stops/routes as CSV with validation for required fields and value ranges.

Routing Solver Backend – FastAPI service using OR-Tools to compute feasible routes from a JSON request.

Health Check & Status Badge – /health endpoint powers a simple “backend online/offline” indicator in the UI.

Map-based Visualization – Leaflet-based OpenStreetMap view with depot and stop markers plus colored route polylines.

Graceful Degradation – Frontend can run without a backend; solving fails with a friendly error if the API is unreachable.

## Tech Stack
### Frontend (endproje)
Framework: React 18, TypeScript, Vite

UI: Mantine (@mantine/core, @mantine/hooks, @mantine/notifications)

Routing: React Router (react-router-dom)

Forms & Validation: React Hook Form, Zod, @hookform/resolvers

HTTP: Axios

Maps: Leaflet, react-leaflet

### Backend (routeops-backend)
Framework: FastAPI

Server: Uvicorn

Optimization: Google OR-Tools

Data & Validation: Pydantic

Numerics: NumPy

HTTP Client: Requests

## Project Structure
Plaintext
ie/
├── endproje/               # Frontend Application
│   ├── src/                # Logic and Components
│   ├── .env                # Environment variables
│   ├── package.json        # Dependencies
│   └── vite.config.ts      # Vite configuration
└── routeops-backend/       # Backend API
    ├── main.py             # FastAPI entry point
    ├── solver.py           # OR-Tools logic
    └── requirements.txt    # Python dependencies
## Setup
### Backend (FastAPI + OR-Tools)
From the repo root, set up the Python environment:

Bash
cd routeops-backend
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
The backend will be available at http://localhost:8000.

### Frontend (React + Vite)
In a separate terminal:

Bash
cd endproje
npm install
npm run dev
The frontend dev server runs on http://localhost:5173.

## Environment
The frontend reads the backend URL from a .env file in endproje/. You can copy from .env.example:

Bash
# Backend API base URL (no trailing slash)
VITE_API_BASE_URL=http://localhost:8000
## How It Works
Define: The React app lets you define stops and vehicle constraints.

Request: Issues a POST /solve request containing the stop data to the FastAPI service.

Optimize: solver.py uses OR-Tools to build the routing model and find the best solution.

Visualize: The frontend renders the response on a Leaflet map and updates KPIs.

## Common Issues
### Frontend cannot reach backend
Make sure the backend is running and the URL matches VITE_API_BASE_URL:

Bash
# Test health endpoint
curl http://localhost:8000/health
### Wrong or missing .env
If the frontend cannot find the backend, ensure your .env is created:

Bash
cd endproje
cp .env.example .env
## Roadmap
[ ] Better solver configuration – Expose more OR-Tools parameters.

[ ] Persistence layer – Optional database to store scenarios.

[ ] Authentication – Multi-user support.

[ ] Deployment docs – Containerized deployment examples.

## License
No explicit project-level license file is included yet. Until a LICENSE is added, treat this codebase as all rights reserved for internal or personal use only.
