from fastapi import APIRouter

from database.database import get_db
from models.schemas import Patient


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


# ADD PATIENT
@router.post("")
def add_patient(patient: Patient):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    INSERT INTO patients
    (
        name,
        age,
        email,
        gender,
        phone,
        date_of_birth,
        blood_group,
        emergency_contact,
        emergency_phone
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient.name,
        patient.age,
        patient.email,
        patient.gender,
        patient.phone,
        patient.date_of_birth,
        patient.blood_group,
        patient.emergency_contact,
        patient.emergency_phone
    ))

    db.commit()

    patient_id = cursor.lastrowid

    db.close()

    return {
        "message": "Patient added successfully",
        "patient_id": patient_id
    }


# GET ALL PATIENTS
@router.get("")
def get_patients():

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT
        id,
        name,
        age,
        email,
        gender,
        phone,
        date_of_birth,
        blood_group,
        emergency_contact,
        emergency_phone
    FROM patients
    """)

    patients = cursor.fetchall()

    db.close()

    return patients


# DELETE PATIENT
@router.delete("/{patient_id}")
def delete_patient(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM patients WHERE id = ?",
        (patient_id,)
    )

    db.commit()

    if cursor.rowcount == 0:
        db.close()
        return {
            "message": "Patient not found"
        }

    db.close()

    return {
        "message": "Patient deleted successfully",
        "patient_id": patient_id
    }

# UPDATE PATIENT
@router.put("/{patient_id}")
def update_patient(patient_id: int, patient: Patient):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    UPDATE patients
    SET
        name = ?,
        age = ?,
        email = ?,
        gender = ?,
        phone = ?,
        date_of_birth = ?,
        blood_group = ?,
        emergency_contact = ?,
        emergency_phone = ?
    WHERE id = ?
    """, (
        patient.name,
        patient.age,
        patient.email,
        patient.gender,
        patient.phone,
        patient.date_of_birth,
        patient.blood_group,
        patient.emergency_contact,
        patient.emergency_phone,
        patient_id
    ))

    db.commit()

    if cursor.rowcount == 0:
        db.close()
        return {
            "message": "Patient not found"
        }

    db.close()

    return {
        "message": "Patient updated successfully",
        "patient_id": patient_id
    }