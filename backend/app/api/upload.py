
from fastapi import APIRouter, File, UploadFile, Depends
from fastapi.responses import JSONResponse
import shutil
import os
from sqlalchemy.orm import Session
from app.core.deps import get_current_user, get_db
from app.utils.profile_img_cleanup import delete_old_profile_image

router = APIRouter(prefix="/api")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '../../static/profile_images')
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # 기존 이미지 삭제 및 DB 저장은 여기서 하지 않음
    filename = file.filename
    import time
    name, ext = os.path.splitext(filename)
    save_name = f"user_{current_user.id}_{int(time.time())}{ext}"
    file_location = os.path.join(UPLOAD_DIR, save_name)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    url = f"/static/profile_images/{save_name}"
    # DB에는 저장하지 않고 URL만 반환
    return {"profile_img_url": url}
