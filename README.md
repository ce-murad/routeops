# 🚚 RouteOps

Vehicle Routing Problem (VRP) web app with real-world road optimization and interactive visualization.

---

## 📦 Features

- Add stops manually or via CSV  
- Configure vehicles, capacity, optimization objective  
- Solve using Google OR-Tools  
- Real road routing with OSRM  
- Map visualization + KPIs  
- Export data  
- Interactive UI  

---

## 🛠 Tech Stack

**Frontend:** React + TypeScript (Vite), Mantine UI, Leaflet  
**Backend:** FastAPI, OR-Tools, OSRM  

---

## 📁 Project Structure

```bash
ie/
├── endproje/           # Frontend (React)
└── routeops-backend/   # Backend (FastAPI)
```

---
## ⚙️ Setup
Backend
cd routeops-backend

python -m venv .venv

# Windows
.\.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload

---

## Frontend
cd endproje

npm install
npm run dev

---

## 🔐 Environment
VITE_API_BASE_URL=http://127.0.0.1:8000

---

## ⚡ Workflow

Add stops

Configure vehicles

Click Solve

## Backend:

Build matrix

Optimize (OR-Tools)

Fetch routes (OSRM)

## Frontend:

Display routes

Show KPIs

---

## ⚠️ Common Issues

Backend offline

uvicorn main:app --reload

---

## Slow solving

OSRM public server limitation

Reduce number of stops

---

npm not found (Mac)

brew install node

---

git not found

brew install git

---

## 🚀 Future Improvements

Save/load scenarios

GeoJSON export

Time constraints

Mobile UI improvements

Deployment (Vercel + Render)

Self-hosted OSRM

---

## 📄 License

MIT License
