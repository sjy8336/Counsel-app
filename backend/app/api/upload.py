from fastapi import APIRouter, File, UploadFile, Depends
from fastapi.responses import JSONResponse
import shutil
import os

router = APIRouter(prefix="/api")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '../../static/profile_images')
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/profile-image")
async def upload_profile_image(file: UploadFile = File(...)):
    filename = file.filename
    # 파일명 중복 방지: 타임스탬프 추가
    import time
    name, ext = os.path.splitext(filename)
    save_name = f"{name}_{int(time.time())}{ext}"
    file_location = os.path.join(UPLOAD_DIR, save_name)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    url = f"/static/profile_images/{save_name}"
    return {"url": url}
