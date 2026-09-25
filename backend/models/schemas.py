from pydantic import BaseModel


class Patient(BaseModel):
    name: str
    age: int
    email: str
    gender: str
    phone: str
    date_of_birth: str
    blood_group: str
    emergency_contact: str
    emergency_phone: str


class Reminder(BaseModel):
    patient_id: int
    title: str
    reminder_date: str

class Medication(BaseModel):
    patient_id: int
    name: str
    dosage: str
    frequency: str
    timing: str
    next_dose: str
    doctor: str
    status: str

class Appointment(BaseModel):
    patient_id: int
    doctor: str
    specialty: str
    hospital: str
    appointment_date: str
    appointment_time: str
    reason: str
    status: str

class SharedRecord(BaseModel):
    patient_id: int
    record_ids: list[int]
    recipient_name: str
    recipient_organization: str
    recipient_contact: str
    duration: str
    view_records: bool
    download_records: bool
    view_timeline: bool
    view_medications: bool

