from fastapi import APIRouter

from database.database import get_db
from models.schemas import Medication


router = APIRouter(
    prefix="/medications",
    tags=["Medications"]
)


# =========================================
# CREATE MEDICATION
# =========================================

@router.post("")
def create_medication(medication: Medication):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    INSERT INTO medications
    (
        patient_id,
        name,
        dosage,
        frequency,
        timing,
        next_dose,
        doctor,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        medication.patient_id,
        medication.name,
        medication.dosage,
        medication.frequency,
        medication.timing,
        medication.next_dose,
        medication.doctor,
        medication.status
    ))

    db.commit()

    medication_id = cursor.lastrowid

    db.close()

    return {
        "message": "Medication created successfully",
        "medication_id": medication_id
    }


# =========================================
# GET MEDICATIONS
# =========================================

@router.get("/{patient_id}")
def get_medications(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT *
    FROM medications
    WHERE patient_id = ?
    ORDER BY id DESC
    """, (patient_id,))

    medications = cursor.fetchall()

    db.close()

    return medications


# =========================================
# DELETE MEDICATION
# =========================================

@router.delete("/{medication_id}")
def delete_medication(medication_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    DELETE FROM medications
    WHERE id = ?
    """, (medication_id,))

    db.commit()

    db.close()

    return {
        "message": "Medication deleted successfully",
        "medication_id": medication_id
    }