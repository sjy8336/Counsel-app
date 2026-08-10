import os
import uuid
import logging

from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.core.config import settings
from app.core.supabase_storage import get_supabase_bucket_name, get_supabase_client

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

@router.post("/upload/profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="이미지 파일만 업로드할 수 있습니다.")

    filename = file.filename or ""
    _, ext = os.path.splitext(filename)
    if not ext:
        ext = ".png"

    unique_filename = f"user_{current_user.id}_{uuid.uuid4().hex}{ext}"
    contents = await file.read()

    bucket_name = get_supabase_bucket_name()
    logger.info(
        "profile image upload start user_id=%s filename=%s content_type=%s bucket=%s has_supabase_url=%s has_service_key=%s",
        getattr(current_user, "id", None),
        file.filename,
        file.content_type,
        bucket_name,
        bool(settings.SUPABASE_URL),
        bool(settings.SUPABASE_SERVICE_ROLE_KEY),
    )

    try:
        supabase = get_supabase_client()
        supabase.storage.from_(bucket_name).upload(
            path=unique_filename,
            file=contents,
            file_options={"content-type": file.content_type, "upsert": "false"},
        )
        public_url_data = supabase.storage.from_(bucket_name).get_public_url(unique_filename)
        public_url = None
        if isinstance(public_url_data, dict):
            public_url = (
                public_url_data.get("publicUrl")
                or public_url_data.get("public_url")
                or public_url_data.get("data", {}).get("publicUrl")
                or public_url_data.get("data", {}).get("public_url")
            )
        else:
            public_url = getattr(public_url_data, "public_url", None)
            if not public_url:
                data = getattr(public_url_data, "data", None)
                if isinstance(data, dict):
                    public_url = data.get("publicUrl") or data.get("public_url")
        if not public_url:
            public_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket_name}/{unique_filename}"
        return {"profile_img_url": public_url}
    except Exception as exc:
        logger.exception(
            "profile image upload failed user_id=%s filename=%s bucket=%s",
            getattr(current_user, "id", None),
            file.filename,
            bucket_name,
        )
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Image upload failed: {exc}")
