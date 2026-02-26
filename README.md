RouteOpsRouteOps is a Vehicle Routing Problem (VRP) web application that enables users to create delivery points, configure fleet constraints, and visualize optimized routes on a real-world road network.🚀 FeaturesFlexible Data Entry: Add stops manually via the UI or bulk-upload through CSV.Smart Configuration:Define the number of vehicles and individual vehicle capacity.Toggle optimization objectives between Distance and Time.Advanced Solver: Leverages Google OR-Tools for solving complex routing logic.Map Visualization: Displays real road paths using OSRM (Open Source Routing Machine).Live KPIs: Instant feedback on total distance, travel time, stops served, and route count.Data Export: Export your processed stops back to CSV.🛠 Tech StackFrontendFramework: React + TypeScript (Vite)UI Components: Mantine UIMapping: Leaflet / OpenStreetMapBackendAPI Framework: FastAPI (Python)Optimization Engine: Google OR-ToolsRouting Engine: OSRM📁 Project StructurePlaintextie/
├── endproje/            # Frontend (React)
└── routeops-backend/    # Backend (FastAPI)
⚙️ Setup Instructions1. Backend SetupOpen a terminal and navigate to the backend directory:Bashcd routeops-backend
Create a virtual environment:Windows:Bashpython -m venv .venv
.\.venv\Scripts\activate
Mac/Linux:Bashpython3 -m venv .venv
source .venv/bin/activate
Install dependencies & run:Bashpip install -r requirements.txt
uvicorn main:app --reload
Health Check: Verify the API is running at http://127.0.0.1:8000/health.2. Frontend SetupOpen a new terminal window:Bashcd endproje
npm install
npm run dev
Access UI: Open http://localhost:5173 in your browser.3. Environment ConfigurationCreate a .env file inside the endproje folder:Code snippetVITE_API_BASE_URL=http://127.0.0.1:8000
Note: Restart the frontend server after updating the .env file.💡 How It WorksInput: Add or generate delivery stops.Constraint: Set vehicle count and capacity limits.Process: Click Solve. The backend builds a distance/time matrix and runs OR-Tools.Result: The frontend fetches OSRM road geometry and renders the interactive map and KPIs.⚠️ TroubleshootingIssueSolutionBackend "Offline"Ensure the Uvicorn server is running and check the /health endpoint.Solve StuckThe public OSRM server may be throttled. Try reducing the number of stops.npm not foundInstall Node.js (e.g., brew install node on Mac).Git not recognizedInstall Git from git-scm.com.🛤 Future Improvements💾 Save/load scenarios for future reference.🌍 Route export via GeoJSON.🕒 Implementation of Time Windows & constraints.📱 Enhanced mobile-responsive UI.🚀 Deployment to Vercel (Frontend) and Render (Backend).License: MIT License
