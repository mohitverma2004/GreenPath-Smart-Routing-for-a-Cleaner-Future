from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.endpoints import routing
import os

app = FastAPI(
    title="GreenPath API",
    description="An intelligent API for eco-friendly vehicle routing.",
    version="1.0.0"
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Router ---
app.include_router(routing.router, prefix="/api/v1", tags=["Routing"])

# --- Static Files (Frontend) ---
frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")
# This goes up from app/main.py to repo root, then frontend/
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
