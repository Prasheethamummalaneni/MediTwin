from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import create_tables
from routes import patients
from routes import medical_records
from routes import reminders
from routes import sharing
from routes import medications
from routes import appointments
from routes import assistant
from routes.health_metrics import router as health_metrics_router
# ========================================================
# APP
# ========================================================

app = FastAPI(title="MediTwin Backend")

# ========================================================
# CORS
# ========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://medi-twin-rosy.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

create_tables()


# ============================================================
# ROUTES
# ============================================================

app.include_router(patients.router)
app.include_router(medical_records.router)
app.include_router(reminders.router)

app.include_router(medications.router)
app.include_router(appointments.router)
app.include_router(sharing.router)
app.include_router(assistant.router)
app.include_router(health_metrics_router)
# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "Welcome to MediTwin Backend",
        "status": "Running"
    }