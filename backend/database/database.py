import sqlite3
import os


DB_NAME = "meditwin.db"
UPLOAD_FOLDER = "uploads"


# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_db():
    return sqlite3.connect(DB_NAME)


def create_tables():

    db = get_db()
    cursor = db.cursor()

    # ============================================================
    # PATIENTS TABLE
    # ============================================================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        email TEXT,
        gender TEXT,
        phone TEXT,
        date_of_birth TEXT,
        blood_group TEXT,
        emergency_contact TEXT,
        emergency_phone TEXT
    )
    """)

    # ============================================================
    # MIGRATE EXISTING PATIENTS TABLE
    # ============================================================

    cursor.execute("PRAGMA table_info(patients)")
    existing_columns = [column[1] for column in cursor.fetchall()]

    new_columns = {
        "email": "TEXT",
        "date_of_birth": "TEXT",
        "blood_group": "TEXT",
        "emergency_contact": "TEXT",
        "emergency_phone": "TEXT",
    }

    for column_name, column_type in new_columns.items():

        if column_name not in existing_columns:

            cursor.execute(
                f"ALTER TABLE patients ADD COLUMN {column_name} {column_type}"
            )

    # ============================================================
    # MEDICAL RECORDS TABLE
    # ============================================================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        filename TEXT,
        category TEXT,
        upload_date TEXT
    )
    """)

    # ============================================================
    # REMINDERS TABLE
    # ============================================================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        title TEXT,
        reminder_date TEXT,
        status TEXT
    )
    """)

    # ============================================================
    # MEDICATIONS TABLE
    # ============================================================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        name TEXT,
        dosage TEXT,
        frequency TEXT,
        timing TEXT,
        next_dose TEXT,
        doctor TEXT,
        status TEXT
    )
    """)

    # ============================================================
    # APPOINTMENTS TABLE
    # ============================================================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        doctor TEXT,
        specialty TEXT,
        hospital TEXT,
        appointment_date TEXT,
        appointment_time TEXT,
        reason TEXT,
        status TEXT
    )
    """)

    # ============================================================
    # SHARED RECORDS TABLE
    # ============================================================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shared_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        patient_id INTEGER,

        record_ids TEXT,

        share_token TEXT,

        recipient_name TEXT,

        recipient_organization TEXT,

        recipient_contact TEXT,

        duration TEXT,

        created_at TEXT,

        expires_at TEXT,

        view_records INTEGER DEFAULT 1,

        download_records INTEGER DEFAULT 0,

        view_timeline INTEGER DEFAULT 0,

        view_medications INTEGER DEFAULT 0,

        status TEXT DEFAULT 'Active'
    )
    """)

    # ============================================================
    # MIGRATE EXISTING SHARED RECORDS TABLE
    # ============================================================

    cursor.execute("PRAGMA table_info(shared_records)")
    existing_shared_columns = [
        column[1] for column in cursor.fetchall()
    ]

    shared_new_columns = {
        "patient_id": "INTEGER",
        "record_ids": "TEXT",
        "recipient_name": "TEXT",
        "recipient_organization": "TEXT",
        "recipient_contact": "TEXT",
        "duration": "TEXT",
        "created_at": "TEXT",
        "expires_at": "TEXT",
        "view_records": "INTEGER DEFAULT 1",
        "download_records": "INTEGER DEFAULT 0",
        "view_timeline": "INTEGER DEFAULT 0",
        "view_medications": "INTEGER DEFAULT 0",
        "status": "TEXT DEFAULT 'Active'",
    }

    for column_name, column_type in shared_new_columns.items():

        if column_name not in existing_shared_columns:

            cursor.execute(
                f"ALTER TABLE shared_records ADD COLUMN {column_name} {column_type}"
            )

    # ============================================================
    # SHARING HISTORY TABLE
    # ============================================================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sharing_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        patient_id INTEGER,

        share_id INTEGER,

        action TEXT,

        recipient_name TEXT,

        record_count INTEGER,

        activity_time TEXT
    )
    """)

    # ============================================================
    # CREATE INDEX FOR SHARE TOKEN
    # ============================================================

    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_shared_records_share_token
    ON shared_records(share_token)
    """)

    # ============================================================
    # HEALTH METRICS TABLE
    # ============================================================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS health_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        heart_rate REAL,
        weight REAL,
        blood_pressure TEXT,
        temperature REAL,
        recorded_at TEXT
    )
    """)

    # ============================================================
    # SAVE CHANGES
    # ============================================================

    db.commit()
    db.close()