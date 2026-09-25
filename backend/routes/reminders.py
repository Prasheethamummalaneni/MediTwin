from fastapi import APIRouter

from database.database import get_db
from models.schemas import Reminder


router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"]
)


@router.post("")
def create_reminder(reminder: Reminder):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    INSERT INTO reminders
    (patient_id, title, reminder_date, status)
    VALUES (?, ?, ?, ?)
    """, (
        reminder.patient_id,
        reminder.title,
        reminder.reminder_date,
        "Pending"
    ))

    db.commit()

    reminder_id = cursor.lastrowid

    db.close()

    return {
        "message": "Reminder created",
        "reminder_id": reminder_id
    }


@router.get("/{patient_id}")
def get_reminders(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT *
    FROM reminders
    WHERE patient_id = ?
    ORDER BY reminder_date
    """, (patient_id,))

    reminders = cursor.fetchall()

    db.close()

    return reminders