import os
import time
import logging
from app.models.user import User
from sqlalchemy.orm import Session
from app.core.config import settings
from app.utils.profile_image_paths import resolve_legacy_profile_image_path

logger = logging.getLogger(__name__)

PROFILE_IMG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../static/profile_images'))

def delete_old_profile_image(db: Session, user_id: int, delete_legacy_local_images: bool | None = None):
    """
    유저의 기존 로컬 프로필 이미지 파일이 있으면 삭제.
    Supabase URL 같은 원격 이미지는 건드리지 않는다.
    """
    should_delete = settings.DELETE_LEGACY_PROFILE_IMAGES if delete_legacy_local_images is None else delete_legacy_local_images
    if not should_delete:
        return

    user = db.query(User).filter(User.id == user_id).first()
    if user and user.profile_img_url:
        img_path = resolve_legacy_profile_image_path(user.profile_img_url, PROFILE_IMG_DIR)
        if not img_path:
            return
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except Exception as e:
                logger.warning("기존 프로필 이미지 삭제 실패: %s - %s", img_path, e)


def cleanup_unused_profile_images(db: Session, days: int = 30, delete_legacy_local_images: bool | None = None):
    """
    users.profile_img_url에 없는 로컬 파일 중 days일 이상 지난 파일만 삭제.
    Supabase URL은 로컬 정리 대상이 아니다.
    """
    should_delete = settings.DELETE_LEGACY_PROFILE_IMAGES if delete_legacy_local_images is None else delete_legacy_local_images
    if not should_delete:
        return

    used_files = set()
    for user in db.query(User).all():
        if user.profile_img_url:
            legacy_path = resolve_legacy_profile_image_path(user.profile_img_url, PROFILE_IMG_DIR)
            if legacy_path:
                used_files.add(os.path.basename(legacy_path))
    now = time.time()
    for fname in os.listdir(PROFILE_IMG_DIR):
        fpath = os.path.join(PROFILE_IMG_DIR, fname)
        if not os.path.isfile(fpath):
            continue
        if fname not in used_files:
            mtime = os.path.getmtime(fpath)
            if now - mtime > days * 86400:
                try:
                    os.remove(fpath)
                except Exception as e:
                    logger.warning("프로필 이미지 정리 실패: %s - %s", fpath, e)
