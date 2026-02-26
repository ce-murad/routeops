# RouteOps 🚚

A modern Vehicle Routing Problem (VRP) optimizer with a clean UI and real road-based routing.

Built with:
- ⚙️ FastAPI (backend)
- 🧠 OR-Tools (optimization)
- 🗺️ OSRM (real road routing)
- 🎨 React + Mantine (frontend)

---

## ✨ Features

- Multi-vehicle route optimization
- Capacity constraints
- Distance vs Time optimization
- Real road-following routes (not straight lines)
- Interactive map visualization
- Editable stops table
- Sample data generator
- Clean, modern UI

---

## 📁 Project Structure


ie/
├── routeops-backend/
│ ├── main.py
│ ├── solver.py
│ └── requirements.txt
│
├── endproje/ (frontend)
│ ├── src/
│ ├── package.json
│ └── ...


---

## ⚙️ Backend Setup

### 1. Navigate to backend

```bash
cd routeops-backend
2. Install dependencies
pip install -r requirements.txt
3. Run server
uvicorn main:app --reload

Backend will run at:

http://127.0.0.1:8000

Test:

http://127.0.0.1:8000/health
💻 Frontend Setup
1. Navigate to frontend
cd endproje
2. Install dependencies
npm install
3. Run frontend
npm run dev

Frontend will run at:

http://localhost:5173
▶️ How to Use

Start backend

Start frontend

Open browser at localhost:5173

Add stops OR click "Add Sample Stops"

Select:

Vehicles

Capacity

Optimization (Time / Distance)

Click Solve

⚙️ Parameters Explained
🚗 Vehicles

Number of available vehicles.

More vehicles → shorter routes

Fewer vehicles → longer routes

📦 Capacity

Maximum load per vehicle.

If capacity is low → more routes required

If high → fewer routes

🎯 Optimization

Distance → shortest routes (km)

Time → fastest routes (traffic-aware via OSRM)

🧠 How It Works

OSRM generates:

Distance matrix

Duration matrix

OR-Tools solves VRP:

Minimizes chosen objective (time or distance)

Respects capacity constraints

OSRM route API:

Converts solution into real road geometry

🚀 Future Improvements

Traffic-aware live routing

Time windows (delivery deadlines)

Driver shift constraints

Export routes to CSV/PDF

Deploy backend (Render / Railway)

Deploy frontend (Vercel)

🛠️ Troubleshooting
Backend not working

Check if running:

uvicorn main:app --reload
Frontend stuck on "Solving..."

Backend is not running

Wrong API URL

Routes not changing (Time vs Distance)

Small datasets → same result

Try with more stops (8–15)

📜 License

MIT License
