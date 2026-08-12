#!/usr/bin/env python3
"""
상담사 자격증 중복 row를 정리하는 스크립트.

중복 기준:
- user_id
- acquisition_date
- certificate_name
- issuer

사용 예시:
python -m app.utils.cleanup_counselor_certificates
python -m app.utils.cleanup_counselor_certificates --apply
"""

import argparse
from collections import defaultdict

from sqlalchemy.orm import sessionmaker

from app.db.session import engine
from app.models.counselor import CounselorCertificate


def normalize_value(value):
    if value is None:
        return ""
    return str(value).strip().lower()


def certificate_key(row):
    return (
        row.user_id,
        normalize_value(row.acquisition_date),
        normalize_value(row.certificate_name),
        normalize_value(row.issuer),
    )


def find_duplicate_ids(rows):
    grouped = defaultdict(list)
    for row in rows:
        grouped[certificate_key(row)].append(row)

    duplicate_ids = []
    for items in grouped.values():
        if len(items) < 2:
            continue
        items.sort(key=lambda item: item.id or 0)
        duplicate_ids.extend(item.id for item in items[1:])
    return duplicate_ids


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply",
        action="store_true",
        help="중복 row를 실제로 삭제합니다. 기본값은 dry-run입니다.",
    )
    args = parser.parse_args()

    session_factory = sessionmaker(bind=engine)
    db = session_factory()
    try:
        rows = db.query(CounselorCertificate).all()
        duplicate_ids = find_duplicate_ids(rows)

        print(f"총 자격증 row: {len(rows)}")
        print(f"중복 row 후보: {len(duplicate_ids)}")

        if not duplicate_ids:
            return

        if not args.apply:
            print("dry-run 모드입니다. 실제 삭제를 원하면 --apply를 붙여주세요.")
            return

        deleted_count = (
            db.query(CounselorCertificate)
            .filter(CounselorCertificate.id.in_(duplicate_ids))
            .delete(synchronize_session=False)
        )
        db.commit()
        print(f"삭제 완료: {deleted_count}건")
    finally:
        db.close()


if __name__ == "__main__":
    main()
