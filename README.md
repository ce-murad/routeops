🚚 RouteOps

A Vehicle Routing Problem (VRP) web application that allows users to create delivery points, configure fleet constraints, and visualize optimized routes on a real road network.

✨ Features

Add stops manually or via CSV

Configure:

Number of vehicles

Vehicle capacity

Optimization objective (distance / time)

Solve routing problem using Google OR-Tools

Visualize routes on a map with real road paths (OSRM)

View KPIs:

Total distance

Total time

Stops served

Number of routes

Export stops to CSV

Interactive UI with tooltips explaining parameters

🛠 Tech Stack
Frontend

React + TypeScript (Vite)

Mantine UI

Leaflet (OpenStreetMap)

Backend

FastAPI (Python)

Google OR-Tools

OSRM (Open Source Routing Machine)

📁 Project Structure
ie/
│
├── endproje/           # Frontend (React)
│
└── routeops-backend/  # Backend (FastAPI)
⚙️ Setup Instructions
1️⃣ Backend Setup
cd routeops-backend
Create virtual environment

Windows

python -m venv .venv
.\.venv\Scripts\activate

Mac / Linux

python3 -m venv .venv
source .venv/bin/activate
Install dependencies
pip install -r requirements.txt
Run backend
uvicorn main:app --reload
Test backend
http://127.0.0.1:8000/health
2️⃣ Frontend Setup
cd endproje
Install dependencies
npm install
Run frontend
npm run dev
Open in browser
http://localhost:5173
🔐 Environment Configuration

Create a .env file inside endproje:

VITE_API_BASE_URL=http://127.0.0.1:8000

After updating .env, restart the frontend.

⚡ How It Works

Add or generate stops

Configure vehicles and capacity

Click Solve

Backend Process

Builds distance/time matrix

Runs OR-Tools optimization

Fetches road geometry via OSRM

Frontend Displays

Optimized routes

Map visualization

Key performance metrics (KPIs)

📊 Understanding Key Parameters
🚛 Vehicles

Number of delivery trucks

More vehicles → shorter individual routes

📦 Capacity

Maximum load per vehicle

If exceeded → routes split or stops may remain unserved

🎯 Objective

Distance → minimizes total kilometers

Time → minimizes travel time (uses OSRM durations)

⚠️ Common Issues
Backend shows "Offline"
uvicorn main:app --reload

Check:

http://127.0.0.1:8000/health
Solve gets stuck

OSRM public server may be slow

Reduce number of stops

Check backend timeout handling

npm not found (Mac)
brew install node
Git not recognized
brew install git

Or download from: https://git-scm.com

🧭 Notes on Routing

Uses public OSRM server

Routes follow real road networks

👉 For production:

Self-host OSRM for better performance

🚀 Future Improvements

Save/load scenarios

Route export (GeoJSON)

Time windows & constraints

Improved mobile UI

Deployment (Vercel + Render)

Custom OSRM backend

📄 License

MIT License
