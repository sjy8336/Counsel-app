#!/usr/bin/env python3
"""
profile_images 폴더에서 users.profile_img_url에 없는 로컬 파일 중 N일 이상 지난 파일을 삭제
사용 예시: python cleanup_profile_images.py 30
레거시 로컬 이미지 삭제를 허용하려면: python cleanup_profile_images.py 30 --delete-legacy
"""
import argparse
import os
import time
import logging
from sqlalchemy.orm import sessionmaker
from app.db.session import engine
from app.models.user import User
from app.utils.profile_image_paths import resolve_legacy_profile_image_path

logger = logging.getLogger(__name__)

PROFILE_IMG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../static/profile_images'))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("days", nargs="?", type=int, default=30)
    parser.add_argument(
        "--delete-legacy",
        action="store_true",
        help="기존 로컬 profile_images 파일 삭제를 허용합니다.",
    )
    args = parser.parse_args()

    if not args.delete_legacy:
        print("레거시 로컬 이미지 삭제는 비활성화되어 있습니다. 삭제하려면 --delete-legacy를 붙여주세요.")
        raise SystemExit(0)

    days = args.days
    Session = sessionmaker(bind=engine)
    db = Session()
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
    db.close()
