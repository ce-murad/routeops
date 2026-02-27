from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from solver import solve_vrp

app = FastAPI(title="RouteOps Backend")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ CORS (allow your Vercel frontend + local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://routeops.vercel.app",   # <-- your Vercel domain
        # if you have another Vercel domain like routeops-xxx.vercel.app add it too
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}


# ✅ CORS: allow browser frontend (Vite) to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/solve")
def solve(req: dict):
    result = solve_vrp(req)
    if result is None:
        return {
            "status": "ok",
            "summary": {
                "totalDistanceKm": 0,
                "totalTimeMin": 0,
                "routes": 0,
                "stopsServed": 0,
            },
            "routes": [],
            "unservedStopIds": [],
        }
    return result
