# RouteOps 
A Vehicle Routing Problem (VRP) web application that allows users to create delivery points, configure fleet constraints, and visualize optimized routes on a real road network.

---

## Features

- Add stops manually or via CSV
- Configure:
  - Number of vehicles
  - Vehicle capacity
  - Optimization objective (distance / time)
- Solve routing problem using **Google OR-Tools**
- Visualize routes on a map with **real road paths (OSRM)**
- View KPIs:
  - Total distance
  - Total time
  - Stops served
  - Number of routes
- Export stops to CSV
- Interactive UI with tooltips explaining each parameter

---

## Tech Stack

### Frontend
- React + TypeScript (Vite)
- Mantine UI
- Leaflet (OpenStreetMap)

### Backend
- FastAPI (Python)
- OR-Tools (optimization)
- OSRM (road routing)

---

## Project Structure


ie/
│
├── endproje/ # Frontend (React)
│
└── routeops-backend/ # Backend (FastAPI)


---

## Setup Instructions

### 1. Backend Setup

Open terminal:

```bash
cd routeops-backend

Create virtual environment:

Windows:

python -m venv .venv
.\.venv\Scripts\activate

Mac/Linux:

python3 -m venv .venv
source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run backend:

uvicorn main:app --reload

Check backend:

http://127.0.0.1:8000/health
2. Frontend Setup

Open another terminal:

cd endproje

Install dependencies:

npm install

Run frontend:

npm run dev

Open:

http://localhost:5173
Environment Configuration

Create a .env file inside endproje:

VITE_API_BASE_URL=http://127.0.0.1:8000

After changing .env, restart frontend.

How It Works

Add or generate stops

Configure vehicles and capacity

Click Solve

Backend:

Builds distance/time matrix

Runs OR-Tools optimization

Fetches road geometry via OSRM

Frontend displays:

Routes

Map visualization

KPIs

Understanding Key Parameters
Vehicles

Number of delivery trucks

More vehicles = more routes, shorter individual trips

Capacity

Max load per vehicle

If total demand exceeds capacity, routes split or stops may be unserved

Objective

Distance: minimizes total kilometers

Time: minimizes travel time (uses OSRM durations)

Common Issues
Backend shows "Offline"

Ensure backend is running:

uvicorn main:app --reload

Check:

http://127.0.0.1:8000/health
Solve gets stuck

OSRM public server may be slow

Reduce number of stops

Ensure backend timeout handling is correct

npm not found (Mac)

Install Node:

brew install node
Git not recognized

Install Git:

brew install git

or download from:
https://git-scm.com

Notes on Routing

Uses public OSRM server

Routes follow real roads

For production use:

Self-host OSRM for better performance

Future Improvements

Save/load scenarios

Route export (GeoJSON)

Time windows & constraints

Better mobile UI

Deployment (Vercel + Render)

Custom OSRM backend

License

MIT License
