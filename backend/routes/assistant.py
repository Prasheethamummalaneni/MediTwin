from fastapi import APIRouter
from pydantic import BaseModel
from database.database import get_db

router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"]
)


class AssistantRequest(BaseModel):
    patient_id: int
    message: str


@router.post("/chat")
def chat_with_assistant(request: AssistantRequest):

    message = request.message.lower().strip()

    db = get_db()
    cursor = db.cursor()

    # =========================================================
    # FETCH PATIENT DATA
    # =========================================================

    # Medical Records
    cursor.execute("""
        SELECT id, filename, category, upload_date
        FROM medical_records
        WHERE patient_id = ?
        ORDER BY id DESC
    """, (request.patient_id,))

    records = cursor.fetchall()

    # Medications
    cursor.execute("""
        SELECT id, name, dosage, frequency, timing, next_dose, doctor, status
        FROM medications
        WHERE patient_id = ?
        ORDER BY id DESC
    """, (request.patient_id,))

    medications = cursor.fetchall()

    # Appointments
    cursor.execute("""
        SELECT id, doctor, specialty, hospital,
               appointment_date, appointment_time,
               reason, status
        FROM appointments
        WHERE patient_id = ?
        ORDER BY appointment_date, appointment_time
    """, (request.patient_id,))

    appointments = cursor.fetchall()

    # Latest Health Metrics
    cursor.execute("""
        SELECT heart_rate, weight, blood_pressure,
               temperature, recorded_at
        FROM health_metrics
        WHERE patient_id = ?
        ORDER BY id DESC
        LIMIT 1
    """, (request.patient_id,))

    health_metrics = cursor.fetchone()

    db.close()

    # =========================================================
    # MEDICAL RECORD QUESTIONS
    # =========================================================

    if (
        "record" in message
        or "report" in message
        or "document" in message
    ):

        if not records:
            response = (
                "You currently don't have any medical records "
                "stored in MediTwin."
            )

        elif "latest" in message or "recent" in message:

            latest = records[0]

            response = (
                f"Your latest medical record is '{latest[1]}'. "
                f"It is categorized as {latest[2] or 'Other'} "
                f"and was uploaded on {latest[3]}."
            )

        elif (
            "how many" in message
            or "count" in message
        ):

            response = (
                f"You currently have {len(records)} medical "
                f"records stored in MediTwin."
            )

        else:

            response = (
                f"You currently have {len(records)} medical records "
                "stored in MediTwin. "
                "You can view them in the Medical Records section."
            )

    # =========================================================
    # MEDICATION QUESTIONS
    # =========================================================

    elif (
        "medication" in message
        or "medicine" in message
        or "medicines" in message
        or "drug" in message
    ):

        if not medications:

            response = (
                "You currently don't have any medications "
                "stored in MediTwin."
            )

        else:

            medication_list = []

            for medication in medications:

                name = medication[1]
                dosage = medication[2]
                frequency = medication[3]

                medication_list.append(
                    f"{name}"
                    f"{f' ({dosage})' if dosage else ''}"
                    f"{f' - {frequency}' if frequency else ''}"
                )

            response = (
                "Your current medications recorded in MediTwin are:\n\n"
                + "\n".join(
                    f"• {item}"
                    for item in medication_list
                )
            )

    # =========================================================
    # APPOINTMENT QUESTIONS
    # =========================================================

    elif (
        "appointment" in message
        or "appointments" in message
        or "doctor" in message
        or "hospital" in message
    ):

        if not appointments:

            response = (
                "You currently don't have any appointments "
                "stored in MediTwin."
            )

        elif (
            "next" in message
            or "upcoming" in message
            or "nearest" in message
        ):

            appointment = appointments[0]

            doctor = appointment[1]
            specialty = appointment[2]
            hospital = appointment[3]
            date = appointment[4]
            time = appointment[5]

            response = (
                f"Your next recorded appointment is with "
                f"{doctor or 'your doctor'}"
                f"{f' ({specialty})' if specialty else ''}. "
                f"It is scheduled for {date} at {time}"
                f"{f' at {hospital}' if hospital else ''}."
            )

        else:

            appointment_list = []

            for appointment in appointments:

                doctor = appointment[1]
                date = appointment[4]
                time = appointment[5]

                appointment_list.append(
                    f"{doctor or 'Doctor'} - {date} at {time}"
                )

            response = (
                "Your recorded appointments are:\n\n"
                + "\n".join(
                    f"• {item}"
                    for item in appointment_list
                )
            )

    # =========================================================
    # HEALTH METRICS QUESTIONS
    # =========================================================

    elif (
        "health metric" in message
        or "health data" in message
        or "heart rate" in message
        or "blood pressure" in message
        or "weight" in message
        or "temperature" in message
        or "vitals" in message
    ):

        if not health_metrics:

            response = (
                "You currently don't have any health metrics "
                "recorded in MediTwin."
            )

        else:

            heart_rate = health_metrics[0]
            weight = health_metrics[1]
            blood_pressure = health_metrics[2]
            temperature = health_metrics[3]

            response = (
                "Your latest recorded health metrics are:\n\n"
                f"• Heart Rate: "
                f"{heart_rate if heart_rate is not None else 'Not recorded'} BPM\n"
                f"• Weight: "
                f"{weight if weight is not None else 'Not recorded'} kg\n"
                f"• Blood Pressure: "
                f"{blood_pressure if blood_pressure else 'Not recorded'}\n"
                f"• Temperature: "
                f"{temperature if temperature is not None else 'Not recorded'} °F"
            )

    # =========================================================
    # TIMELINE / HISTORY QUESTIONS
    # =========================================================

    elif (
        "timeline" in message
        or "health history" in message
        or "medical history" in message
    ):

        if not records:

            response = (
                "Your MediTwin Health Timeline is currently empty "
                "because no medical records are stored yet."
            )

        else:

            response = (
                f"Your MediTwin Health Timeline contains "
                f"{len(records)} medical records. "
                "These records are organized chronologically "
                "to help you understand your health history over time."
            )

    # =========================================================
    # GREETING
    # =========================================================

    elif (
        "hello" in message
        or "hi" in message
        or "hey" in message
    ):

        response = (
            "Hello! 👋 I'm your MediTwin AI Assistant. "
            "I can help you understand your stored health information, "
            "including your medical records, medications, appointments "
            "and health metrics."
        )

    # =========================================================
    # GENERAL HELP
    # =========================================================

    elif (
        "what can you do" in message
        or "help" in message
        or "what do you do" in message
    ):

        response = (
            "I can help you with your stored MediTwin information. "
            "You can ask me about your medical records, current "
            "medications, upcoming appointments, health metrics "
            "or health timeline."
        )

    # =========================================================
    # DEFAULT RESPONSE
    # =========================================================

    else:

        response = (
            "I can help you with your stored MediTwin information. "
            "Try asking about your medical records, medications, "
            "appointments, health metrics or health timeline."
        )

    return {
        "response": response
    }