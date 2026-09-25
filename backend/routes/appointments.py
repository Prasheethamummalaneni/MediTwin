from fastapi import APIRouter
from database.database import get_db
from models.schemas import Appointment

router = APIRouter(prefix="/appointments", tags=["Appointments"])


# CREATE APPOINTMENT
@router.post("")
def create_appointment(appointment: Appointment):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    INSERT INTO appointments
    (
        patient_id,
        doctor,
        specialty,
        hospital,
        appointment_date,
        appointment_time,
        reason,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        appointment.patient_id,
        appointment.doctor,
        appointment.specialty,
        appointment.hospital,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.reason,
        appointment.status
    ))

    db.commit()

    appointment_id = cursor.lastrowid

    db.close()

    return {
        "message": "Appointment created successfully",
        "appointment_id": appointment_id
    }


# GET APPOINTMENTS
@router.get("/{patient_id}")
def get_appointments(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT *
    FROM appointments
    WHERE patient_id = ?
    ORDER BY appointment_date, appointment_time
    """, (patient_id,))

    appointments = cursor.fetchall()

    db.close()

    return appointments


# DELETE APPOINTMENT
@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    DELETE FROM appointments
    WHERE id = ?
    """, (appointment_id,))

    db.commit()

    db.close()

    return {
        "message": "Appointment deleted successfully",
        "appointment_id": appointment_id
    }