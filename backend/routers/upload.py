from fastapi import APIRouter, UploadFile, File, Depends
from typing import List
from auth import get_current_user

router = APIRouter()

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    return {"filename": file.filename, "status": "uploaded"}
