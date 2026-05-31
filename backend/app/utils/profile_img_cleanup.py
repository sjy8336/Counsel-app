import os
import time
import logging
from app.models.user import User
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

PROFILE_IMG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../static/profile_images'))

def delete_old_profile_image(db: Session, user_id: int):
    """
    유저의 기존 프로필 이미지 파일이 있으면 삭제
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.profile_img_url:
        # /static/profile_images/xxx.png → 실제 파일 경로로 변환
        img_path = user.profile_img_url
        if img_path.startswith('/static/'):
            img_path = img_path.replace('/static/', PROFILE_IMG_DIR + os.sep)
        else:
            img_path = os.path.join(PROFILE_IMG_DIR, os.path.basename(img_path))
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except Exception as e:
                logger.warning("기존 프로필 이미지 삭제 실패: %s - %s", img_path, e)


def cleanup_unused_profile_images(db: Session, days: int = 30):
    """
    users.profile_img_url에 없는 파일 중 days일 이상 지난 파일 삭제
    """
    used_files = set()
    for user in db.query(User).all():
        if user.profile_img_url:
            used_files.add(os.path.basename(user.profile_img_url))
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
