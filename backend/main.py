
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from sheets import append_employee, update_ids, update_employee, delete_employee, find_employee_row, list_employees, append_holiday, find_holiday, list_holidays, update_holiday, delete_holiday, append_leave, list_leaves, update_leave_status, find_leave_row
from drive import setup_employee_folders, upload_photo, rename_employee_folder, delete_employee_folder
from fastapi.middleware.cors import CORSMiddleware
from models import EmployeeUpdate, HolidayCreate, LeaveCreate, LeaveUpdate, LeaveStatus, DocumentRequest
from models import HolidayUpdate

# Email utility
from email_utils import send_leave_status_email
from drive import _get_or_create_profile_folder, delete_drive_file

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@app.post("/employees/")
async def create_employee(
    email: str = Form(...),
    name: str = Form(...),
    position: str = Form(...),
    department: str = Form(...),
    contact: str = Form(...),
    joining_date: str = Form(...),
    profile_photo: UploadFile = File(...)
):

    data = {
        "email": email,
        "name": name,
        "position": position,
        "department": department,
        "contact": contact,
        "joining_date": joining_date
    }

    # Duplicate email check
    if find_employee_row(email):
        raise HTTPException(400, "Employee already exists")

    row_no = append_employee(data)
    if not row_no:
        raise HTTPException(500, "Could not append to sheet")

    # 2) Make Drive folders
    folders = setup_employee_folders(email)

    # 3) Upload the photo
    photo_id = upload_photo(profile_photo, folders["photo"])

    # 4) Update the sheet with IDs
    update_ids(row_no, photo_id, folders["base"])

    return {
        "row": row_no,
        "folder_id": folders["base"],
        "photo_file_id": photo_id
    }


# ---------------------------------------------------------------------------
# Update employee endpoint
# ---------------------------------------------------------------------------


@app.put("/employees/{email}")
async def edit_employee(email: str, payload: EmployeeUpdate):
    # Find the existing row and folder information first
    row = find_employee_row(email)
    if not row:
        raise HTTPException(404, "Employee not found")

    # Read folder id from sheet (columns H/I). Fetch row values
    from sheets import _get_sheets_service, SPREADSHEET_ID, SHEET_NAME  # type: ignore
    svc = _get_sheets_service()
    resp = svc.values().get(spreadsheetId=SPREADSHEET_ID, range=f"{SHEET_NAME}!H{row}:I{row}").execute()
    vals = resp.get("values", [[]])
    photo_id = vals[0][0] if vals and len(vals[0]) > 0 else None
    folder_id = vals[0][1] if vals and len(vals[0]) > 1 else None

    # Update row in Sheets
    update_employee(email, payload.dict(exclude_none=True))

    # If email is changed, rename Drive folder
    if payload.email and folder_id:
        rename_employee_folder(folder_id, payload.email)

    return {"status": "updated", "row": row}


# ---------------------------------------------------------------------------
# Delete employee endpoint
# ---------------------------------------------------------------------------


@app.delete("/employees/{email}")
async def remove_employee(email: str):
    row = find_employee_row(email)
    if not row:
        raise HTTPException(404, "Employee not found")

    # Get folder id from sheet before deleting
    from sheets import _get_sheets_service, SPREADSHEET_ID, SHEET_NAME  # type: ignore
    svc = _get_sheets_service()
    resp = svc.values().get(spreadsheetId=SPREADSHEET_ID, range=f"{SHEET_NAME}!H{row}:I{row}").execute()
    vals = resp.get("values", [[]])
    folder_id = vals[0][1] if vals and len(vals[0]) > 1 else None

    # Delete row in Sheets
    delete_employee(email)

    # Delete Drive folder if present
    if folder_id:
        delete_employee_folder(folder_id)

    return {"status": "deleted", "row": row}

# ---------------------------------------------------------------------------
# List employees endpoint
# ---------------------------------------------------------------------------


@app.get("/employees/")
async def list_all_employees():
    return list_employees()

# ---------------------------------------------------------------------------
# Get single employee endpoint
# ---------------------------------------------------------------------------


@app.get("/employees/{email}")
async def get_employee(email: str):
    """Return a single employee record looked-up by email (case-insensitive).

    The response mirrors an item from ``/employees/`` but adds a convenience
    ``photo_url`` field that can be embedded directly in an <img/> tag if the
    employee has a profile photo stored in Drive.
    """
    employees = list_employees()
    match = next((e for e in employees if e["email"].lower() == email.lower()), None)
    if not match:
        raise HTTPException(404, "Employee not found")

    photo_id = match.get("photo_file_id")
    if photo_id:
        match["photo_url"] = f"https://drive.google.com/uc?id={photo_id}"
    return match

# ---------------------------------------------------------------------------
# Employee profile photo retrieval endpoint
# ---------------------------------------------------------------------------


from fastapi.responses import StreamingResponse
from io import BytesIO


@app.get("/employees/{email}/photo")
async def get_profile_photo(email: str):
    """Stream the employee's profile photo directly from Google Drive.

    Steps:
    1. Locate the employee row via email in the Sheet.
    2. Read the *photo_file_id* from column H.
    3. Download the binary from Drive and stream it back with the correct
       MIME type.
    """

    # 1) Find sheet row
    row = find_employee_row(email)
    if not row:
        raise HTTPException(404, "Employee not found")

    # 2) Fetch photo file id
    from sheets import _get_sheets_service, SPREADSHEET_ID, SHEET_NAME  # type: ignore

    svc_sheets = _get_sheets_service()
    resp = svc_sheets.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!H{row}:H{row}"
    ).execute()
    vals = resp.get("values", [[]])
    photo_file_id = vals[0][0] if vals and len(vals[0]) > 0 else None

    if not photo_file_id:
        raise HTTPException(404, "Profile photo not set for this employee")

    # 3) Download from Drive
    from drive import _get_drive_service  # type: ignore

    drive_svc = _get_drive_service()

    # Retrieve mimeType first
    meta = drive_svc.files().get(fileId=photo_file_id, fields="mimeType,name").execute()
    mime_type = meta.get("mimeType", "application/octet-stream")

    # Download the file content into memory (photos are small)
    fh: BytesIO = BytesIO()
    from googleapiclient.http import MediaIoBaseDownload  # type: ignore

    request = drive_svc.files().get_media(fileId=photo_file_id)
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    fh.seek(0)

    return StreamingResponse(fh, media_type=mime_type)

# ---------------------------------------------------------------------------
# Create holiday endpoint
# ---------------------------------------------------------------------------


@app.post("/holidays/")
async def create_holiday(payload: HolidayCreate):
    # Duplicate check
    date_str = payload.date.strftime("%d-%m-%Y")
    if find_holiday(payload.name, date_str):
        raise HTTPException(400, "Holiday already exists")

    append_holiday(payload.dict())
    return {"status": "holiday added"}


# ---------------------------------------------------------------------------
# Holiday list endpoint
# ---------------------------------------------------------------------------


@app.get("/holidays/")
async def get_holidays():
    return list_holidays()


# ---------------------------------------------------------------------------
# Holiday update endpoint
# ---------------------------------------------------------------------------


@app.put("/holidays/{name}/{date}")
async def edit_holiday(name: str, date: str, payload: HolidayUpdate):
    # date in path expected dd-mm-yyyy
    from sheets import find_holiday_row  # import inside to avoid circular
    if not find_holiday_row(name, date):
        raise HTTPException(404, "Holiday not found")

    update_holiday(name, date, payload.dict(exclude_none=True))
    return {"status": "holiday updated"}


# ---------------------------------------------------------------------------
# Holiday delete endpoint
# ---------------------------------------------------------------------------


@app.delete("/holidays/{name}/{date}")
async def remove_holiday(name: str, date: str):
    from sheets import find_holiday_row
    if not find_holiday_row(name, date):
        raise HTTPException(404, "Holiday not found")

    delete_holiday(name, date)
    return {"status": "holiday deleted"}

# ---------------------------------------------------------------------------
# Leave request endpoints
# ---------------------------------------------------------------------------


@app.post("/leaves/")
async def request_leave(payload: LeaveCreate):
    # Duplicate prevention: same employee + applied_date (today)
    applied_str = payload.applied_date.strftime("%d-%m-%Y")
    if find_leave_row(payload.employee, applied_str):
        raise HTTPException(400, "Leave request already exists for today")

    # Append to sheet
    row = append_leave(payload.dict())
    return {"row": row, "status": payload.status.value.lower()}


@app.get("/leaves/")
async def get_leaves():
    return list_leaves()


@app.patch("/leaves/{employee}/{applied_date}")
async def decide_leave(employee: str, applied_date: str, payload: LeaveUpdate):
    # applied_date expects dd-mm-yyyy
    row = find_leave_row(employee, applied_date)
    if not row:
        raise HTTPException(404, "Leave request not found")

    # Update status in the sheet
    update_leave_status(employee, applied_date, payload.status.value)

    # ------------------------------------------------------------------
    # Send email notification to the employee
    # ------------------------------------------------------------------
    try:
        # Fetch leave details for the row we just updated
        from sheets import _get_sheets_service, SPREADSHEET_ID, LEAVE_APPROVAL_SHEET_NAME, SHEET_NAME, find_employee_row  # type: ignore

        svc = _get_sheets_service()

        # Row numbers are 1-based
        leave_resp = svc.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{LEAVE_APPROVAL_SHEET_NAME}'!B{row}:F{row}"
        ).execute()

        leave_vals = leave_resp.get("values", [[]])[0]
        padded = leave_vals + ["", "", "", "", ""]
        emp_email, leave_type, duration, applied_dt, status_val = padded[:5]

        # Fetch employee name from Employee sheet
        emp_row = find_employee_row(emp_email)
        emp_name = emp_email  # fallback to email if name not found
        if emp_row:
            emp_resp = svc.values().get(
                spreadsheetId=SPREADSHEET_ID,
                range=f"{SHEET_NAME}!C{emp_row}"
            ).execute()
            row_vals = emp_resp.get("values", [[]])
            if row_vals and row_vals[0]:
                emp_name = row_vals[0][0]

        # Send email
        send_leave_status_email(
            to_email=emp_email,
            employee_name=emp_name,
            leave_type=leave_type,
            duration=duration,
            status=status_val or payload.status.value,
        )
    except Exception as exc:
        # Log but don't fail the API if email fails.
        print(f"[WARN] Failed to send leave status email: {exc}")

    return {"row": row, "status": payload.status.value}


# ---------------------------------------------------------------------------
# Document request endpoint
# ---------------------------------------------------------------------------


@app.post("/documents/")
async def request_document(payload: DocumentRequest):
    """Employees submit a request for an official document.

    The request is appended to the ``Documents`` sheet. Initial status is *Pending*.
    Returns the new row number and status.
    """
    try:
        from sheets import append_document_request  # type: ignore
        row = append_document_request(payload.dict())
        return {"row": row, "status": "pending"}
    except Exception as exc:
        raise HTTPException(500, str(exc))

# List document requests (admin or user-facing)


@app.get("/documents/")
async def get_document_requests():
    """Return all document requests from the Documents sheet."""
    try:
        from sheets import list_document_requests  # type: ignore
        return list_document_requests()
    except Exception as exc:
        raise HTTPException(500, str(exc))

# ---------------------------------------------------------------------------
# Employee update: profile photo (employee-facing)
# ---------------------------------------------------------------------------


@app.put("/employees/{email}/photo")
async def update_profile_photo(email: str, photo: UploadFile = File(...)):
    """Allow an employee to replace their profile photo.

    1) Find the employee row via email.
    2) Locate (or create) the 'Profile Photo' subfolder in Drive.
    3) Delete the existing photo file (if any).
    4) Upload the new photo and update column H in the sheet.
    """

    # Find employee row
    row = find_employee_row(email)
    if not row:
        raise HTTPException(404, "Employee not found")

    # Fetch existing photo file id and base folder id from sheet
    from sheets import _get_sheets_service, SPREADSHEET_ID, SHEET_NAME  # type: ignore

    svc = _get_sheets_service()
    resp = svc.values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!H{row}:I{row}"
    ).execute()
    vals = resp.get("values", [[]])
    photo_file_id = vals[0][0] if vals and len(vals[0]) > 0 else None
    base_folder_id = vals[0][1] if vals and len(vals[0]) > 1 else None

    if not base_folder_id:
        raise HTTPException(500, "Employee Drive folder not set for this employee")

    # Ensure we have profile photo folder
    profile_folder_id = _get_or_create_profile_folder(base_folder_id)

    # Delete old photo (ignore if missing)
    if photo_file_id:
        delete_drive_file(photo_file_id)

    # Upload new photo
    new_photo_id = upload_photo(photo, profile_folder_id)

    # Update sheet column H with new photo id
    svc.values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!H{row}",
        valueInputOption="RAW",
        body={"values": [[new_photo_id]]}
    ).execute()

    return {"status": "photo updated", "photo_file_id": new_photo_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
