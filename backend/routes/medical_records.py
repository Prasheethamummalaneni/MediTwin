from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from datetime import datetime
import os
import shutil

from database.database import get_db, UPLOAD_FOLDER
from services.document_classifier import categorize_document
from services.document_processor import extract_text


router = APIRouter(
    tags=["Medical Records"]
)


# =========================================
# UPLOAD MEDICAL RECORD
# =========================================

@router.post("/upload/{patient_id}")
async def upload_document(
    patient_id: int,
    file: UploadFile = File(...)
):

    # Check whether patient exists
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id FROM patients WHERE id = ?",
        (patient_id,)
    )

    patient = cursor.fetchone()

    db.close()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Get filename
    filename = file.filename

    # Validate file type
    allowed_extensions = [".pdf", ".txt"]

    if not filename or not any(
        filename.lower().endswith(ext)
        for ext in allowed_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a PDF or TXT file."
        )

    # Save file
    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    # Extract text
    try:
        text = extract_text(file_path)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the PDF file."
        )

    # Categorize document
    category = categorize_document(text)

    # Save record in database
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    INSERT INTO medical_records
    (patient_id, filename, category, upload_date)
    VALUES (?, ?, ?, ?)
    """, (
        patient_id,
        filename,
        category,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    db.commit()

    record_id = cursor.lastrowid

    db.close()

    return {
        "message": "Document uploaded successfully",
        "record_id": record_id,
        "filename": filename,
        "category": category
    }


# =========================================
# GET MEDICAL RECORDS
# =========================================

@router.get("/records/{patient_id}")
def get_records(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT *
    FROM medical_records
    WHERE patient_id = ?
    ORDER BY upload_date DESC
    """, (patient_id,))

    records = cursor.fetchall()

    db.close()

    return records


# =========================================
# DELETE MEDICAL RECORD
# =========================================

@router.delete("/records/{record_id}")
def delete_record(record_id: int):

    db = get_db()
    cursor = db.cursor()

    # First get the filename
    cursor.execute("""
    SELECT filename
    FROM medical_records
    WHERE id = ?
    """, (record_id,))

    record = cursor.fetchone()

    if not record:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="Medical record not found"
        )

    filename = record[0]

    # Delete record from database
    cursor.execute("""
    DELETE FROM medical_records
    WHERE id = ?
    """, (record_id,))

    db.commit()

    db.close()

    # Delete actual uploaded file
    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    if os.path.exists(file_path):
        os.remove(file_path)

    return {
        "message": "Medical record deleted successfully",
        "record_id": record_id
    }

# =========================================
# VIEW MEDICAL RECORD
# =========================================

@router.get("/record/{record_id}/view")
def view_record(record_id: int):

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
            detail="Medical document file not found"
        )

    if filename.lower().endswith(".pdf"):
        media_type = "application/pdf"
    else:
        media_type = "text/plain"

    return FileResponse(
        path=file_path,
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )

# =========================================
# DOWNLOAD MEDICAL RECORD
# =========================================

@router.get("/record/{record_id}/download")
def download_record(record_id: int):


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
            detail="Medical document file not found"
        )

    if filename.lower().endswith(".pdf"):
        media_type = "application/pdf"
    else:
        media_type = "text/plain"

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )

# =========================================
# HEALTH TIMELINE
# =========================================

@router.get("/timeline/{patient_id}")
def health_timeline(patient_id: int):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
    SELECT
        id,
        filename,
        category,
        upload_date
    FROM medical_records
    WHERE patient_id = ?
    ORDER BY upload_date ASC
    """, (patient_id,))

    timeline = cursor.fetchall()

    db.close()

    return {
        "patient_id": patient_id,
        "timeline": timeline
    }

