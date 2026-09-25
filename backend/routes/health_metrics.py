from fastapi import APIRouter, HTTPException
from database.database import get_db

router = APIRouter(
    prefix="/health-metrics",
    tags=["Health Metrics"]
)


# ==========================================
# CREATE / SAVE HEALTH METRICS
# ==========================================

@router.post("")
def create_health_metrics(data: dict):

    patient_id = data.get("patient_id")

    if not patient_id:
        raise HTTPException(
            status_code=400,
            detail="Patient ID is required"
        )

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    INSERT INTO health_metrics
    (
        patient_id,
        heart_rate,
        weight,
        blood_pressure,
        temperature,
        recorded_at
    )
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    """, (
        patient_id,
        data.get("heart_rate"),
        data.get("weight"),
        data.get("blood_pressure"),
        data.get("temperature")
    ))

    db.commit()

    metric_id = cursor.lastrowid

    db.close()

    return {
        "message": "Health metrics saved successfully",
        "metric_id": metric_id
    }


# ==========================================
# GET LATEST HEALTH METRICS
# ==========================================

@router.get("/{patient_id}")
def get_health_metrics(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT
        id,
        patient_id,
        heart_rate,
        weight,
        blood_pressure,
        temperature,
        recorded_at
    FROM health_metrics
    WHERE patient_id = ?
    ORDER BY id DESC
    LIMIT 1
    """, (patient_id,))

    metric = cursor.fetchone()

    db.close()

    if not metric:
        return {
            "message": "No health metrics found",
            "data": None
        }

    return {
        "id": metric[0],
        "patient_id": metric[1],
        "heart_rate": metric[2],
        "weight": metric[3],
        "blood_pressure": metric[4],
        "temperature": metric[5],
        "recorded_at": metric[6]
    }