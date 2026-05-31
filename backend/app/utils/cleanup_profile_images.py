#!/usr/bin/env python3
"""
profile_images 폴더에서 users.profile_img_url에 없는 파일 중 N일 이상 지난 파일을 삭제
사용 예시: python cleanup_profile_images.py 30
"""
import sys
import os
import time
import logging
from sqlalchemy.orm import sessionmaker
from app.db.session import engine
from app.models.user import User

logger = logging.getLogger(__name__)

PROFILE_IMG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../static/profile_images'))

if __name__ == "__main__":
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    Session = sessionmaker(bind=engine)
    db = Session()
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
    db.close()
