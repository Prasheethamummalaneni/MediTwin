from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
import secrets
import json

from datetime import datetime, timedelta

from database.database import get_db, UPLOAD_FOLDER
from models.schemas import SharedRecord


router = APIRouter(
    tags=["Secure Sharing"]
)


# ============================================================
# CREATE SECURE SHARE
# ============================================================

@router.post("/sharing")
def create_secure_share(share: SharedRecord):
    db = get_db()
    cursor = db.cursor()

    # Check patient
    cursor.execute(
        "SELECT id FROM patients WHERE id = ?",
        (share.patient_id,)
    )

    patient = cursor.fetchone()

    if not patient:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Check selected records
    if not share.record_ids:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Please select at least one medical record"
        )

    # Generate secure token
    share_token = secrets.token_urlsafe(32)

    # Convert duration into days
    duration_days = {
        "1 day": 1,
        "3 days": 3,
        "7 days": 7
    }

    days = duration_days.get(share.duration, 7)

    # Create dates
    created_at = datetime.now()
    expires_at = created_at + timedelta(days=days)

    # Convert record IDs to JSON
    record_ids_json = json.dumps(share.record_ids)

    # Insert share
    cursor.execute("""
    INSERT INTO shared_records
    (
        patient_id,
        record_ids,
        share_token,
        recipient_name,
        recipient_organization,
        recipient_contact,
        duration,
        created_at,
        expires_at,
        view_records,
        download_records,
        view_timeline,
        view_medications,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        share.patient_id,
        record_ids_json,
        share_token,
        share.recipient_name,
        share.recipient_organization,
        share.recipient_contact,
        share.duration,
        created_at.strftime("%Y-%m-%d %H:%M:%S"),
        expires_at.strftime("%Y-%m-%d %H:%M:%S"),
        int(share.view_records),
        int(share.download_records),
        int(share.view_timeline),
        int(share.view_medications),
        "Active"
    ))

    share_id = cursor.lastrowid

    # Add entry to sharing history
    cursor.execute("""
    INSERT INTO sharing_history
    (
        patient_id,
        share_id,
        action,
        recipient_name,
        record_count,
        activity_time
    )
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        share.patient_id,
        share_id,
        "Share Created",
        share.recipient_name,
        len(share.record_ids),
        created_at.strftime("%Y-%m-%d %H:%M:%S")
    ))

    db.commit()
    db.close()

    # Generate sharing link
    share_link = f"http://127.0.0.1:8000/shared/{share_token}"

    return {
        "message": "Medical records shared successfully",
        "share_id": share_id,
        "share_token": share_token,
        "share_link": share_link,
        "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "expires_at": expires_at.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "Active"
    }

# ============================================================
# SHARING HISTORY
# ============================================================


@router.get("/sharing/history/{patient_id}")
def get_sharing_history(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT
        id,
        share_id,
        action,
        recipient_name,
        record_count,
        activity_time
    FROM sharing_history
    WHERE patient_id = ?
    ORDER BY activity_time DESC
    """, (patient_id,))

    history = cursor.fetchall()

    db.close()

    return [
        {
            "id": item[0],
            "share_id": item[1],
            "action": item[2],
            "recipient_name": item[3],
            "record_count": item[4],
            "activity_time": item[5]
        }
        for item in history
    ]

# ============================================================
# GET ACTIVE SHARES
# ============================================================

@router.get("/sharing/{patient_id}")
def get_active_shares(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT
        id,
        patient_id,
        record_ids,
        share_token,
        recipient_name,
        recipient_organization,
        recipient_contact,
        duration,
        created_at,
        expires_at,
        view_records,
        download_records,
        view_timeline,
        view_medications,
        status
    FROM shared_records
    WHERE patient_id = ?
    AND status = 'Active'
    ORDER BY created_at DESC
    """, (patient_id,))

    shares = cursor.fetchall()

    db.close()

    result = []

    for share in shares:

        # ----------------------------------------------------
        # Check expiry
        # ----------------------------------------------------

        expires_at = datetime.strptime(
            share[9],
            "%Y-%m-%d %H:%M:%S"
        )

        status = share[14]

        if expires_at < datetime.now():

            status = "Expired"

        result.append({

            "id": share[0],

            "patient_id": share[1],

            "record_ids": (
                json.loads(share[2])
                if share[2]
                else []
            ),

            "share_token": share[3],

            "recipient_name": share[4],

            "recipient_organization": share[5],

            "recipient_contact": share[6],

            "duration": share[7],

            "created_at": share[8],

            "expires_at": share[9],

            "view_records": bool(share[10]),

            "download_records": bool(share[11]),

            "view_timeline": bool(share[12]),

            "view_medications": bool(share[13]),

            "status": status,

            "share_link": (
                f"http://127.0.0.1:8000/shared/{share[3]}"
            )
        })

    return result


# ============================================================
# REVOKE SHARE
# ============================================================

@router.delete("/sharing/{share_id}")
def revoke_share(share_id: int):

    db = get_db()
    cursor = db.cursor()

    # --------------------------------------------------------
    # Find share
    # --------------------------------------------------------

    cursor.execute("""
    SELECT
        patient_id,
        recipient_name,
        record_ids
    FROM shared_records
    WHERE id = ?
    """, (share_id,))

    share = cursor.fetchone()

    if not share:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Share not found"
        )

    patient_id = share[0]

    recipient_name = share[1]

    record_ids = (
        json.loads(share[2])
        if share[2]
        else []
    )

    # --------------------------------------------------------
    # Revoke
    # --------------------------------------------------------

    cursor.execute("""
    UPDATE shared_records
    SET status = 'Revoked'
    WHERE id = ?
    """, (share_id,))

    # --------------------------------------------------------
    # Add history
    # --------------------------------------------------------

    cursor.execute("""
    INSERT INTO sharing_history
    (
        patient_id,
        share_id,
        action,
        recipient_name,
        record_count,
        activity_time
    )
    VALUES (?, ?, ?, ?, ?, ?)
    """, (
        patient_id,
        share_id,
        "Access Revoked",
        recipient_name,
        len(record_ids),
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    ))

    db.commit()
    db.close()

    return {
        "message": "Sharing access revoked successfully",
        "share_id": share_id
    }

# ============================================================
# ACCESS SHARED RECORD
# ============================================================

@router.get("/shared/{token}")
def access_shared_record(token: str):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT
        id,
        patient_id,
        record_ids,
        recipient_name,
        recipient_organization,
        expires_at,
        view_records,
        download_records,
        view_timeline,
        view_medications,
        status
    FROM shared_records
    WHERE share_token = ?
    """, (token,))

    share = cursor.fetchone()

    if not share:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Invalid sharing token"
        )

    # --------------------------------------------------------
    # Check status
    # --------------------------------------------------------

    if share[10] != "Active":

        db.close()

        raise HTTPException(
            status_code=403,
            detail="This sharing link is no longer active"
        )

    # --------------------------------------------------------
    # Check expiry
    # --------------------------------------------------------

    expires_at = datetime.strptime(
        share[5],
        "%Y-%m-%d %H:%M:%S"
    )

    if expires_at < datetime.now():

        cursor.execute("""
        UPDATE shared_records
        SET status = 'Expired'
        WHERE id = ?
        """, (share[0],))

        db.commit()
        db.close()

        raise HTTPException(
            status_code=403,
            detail="This sharing link has expired"
        )

    # --------------------------------------------------------
    # Get selected records
    # --------------------------------------------------------

    record_ids = (
        json.loads(share[2])
        if share[2]
        else []
    )

    records = []

    if share[6] and record_ids:

        placeholders = ",".join(
            ["?"] * len(record_ids)
        )

        cursor.execute(
            f"""
            SELECT
                id,
                filename,
                category,
                upload_date
            FROM medical_records
            WHERE id IN ({placeholders})
            """,
            tuple(record_ids)
        )

        rows = cursor.fetchall()

        records = [
            {
                "id": row[0],
                "filename": row[1],
                "category": row[2],
                "upload_date": row[3]
            }
            for row in rows
        ]

    db.close()

    return {
        "message": "Shared medical records",
        "recipient_name": share[3],
        "recipient_organization": share[4],
        "expires_at": share[5],
        "permissions": {
            "view_records": bool(share[6]),
            "download_records": bool(share[7]),
            "view_timeline": bool(share[8]),
            "view_medications": bool(share[9])
        },
        "records": records
    }


# ============================================================
# DOCUMENT DOWNLOAD
# ============================================================

@router.get("/download/{record_id}")
def download_document(record_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT filename
    FROM medical_records
    WHERE id = ?
    """, (record_id,))

    record = cursor.fetchone()

    db.close()

    if not record:

        raise HTTPException(
            status_code=404,
            detail="Medical record not found"
        )

    filename = record[0]

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    if not os.path.exists(file_path):

        raise HTTPException(
            status_code=404,
            detail="Document file not found"
        )

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/pdf"
    )