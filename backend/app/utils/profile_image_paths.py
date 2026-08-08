import os
from typing import Optional


def is_remote_image_url(value: Optional[str]) -> bool:
    if not value:
        return False
    return value.startswith(("http://", "https://", "data:", "blob:"))


def resolve_legacy_profile_image_path(value: Optional[str], profile_img_dir: str) -> Optional[str]:
    """
    레거시 로컬 저장 경로만 실제 파일 경로로 바꾼다.
    Supabase URL 같은 원격 주소는 None을 반환한다.
    """
    if not value or is_remote_image_url(value):
        return None

    if value.startswith("/static/"):
        return value.replace("/static/", profile_img_dir + os.sep)

    if value.startswith("static/"):
        return os.path.join(os.path.dirname(profile_img_dir), value)

    return os.path.join(profile_img_dir, os.path.basename(value))

