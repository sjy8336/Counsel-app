# 내담자(클라이언트)용 상담일지 전체 조회 (상담사 조건 없이 client_id만)
def get_client_logs_for_client(db: Session, client_id: int):
    from app.models.user import User
    logs = db.query(CounselingLog).filter(
        CounselingLog.client_id == client_id
    ).order_by(CounselingLog.session_number.desc()).all()

    # 각 log에 counselor_name 속성 추가
    for log in logs:
        log.counselor_name = log.counselor.full_name if log.counselor else None
    return logs
from sqlalchemy.orm import Session
from app.models.counseling_log import CounselingLog
from app.schemas.counseling_log import CounselingLogCreate
from app.utils.keyword_extractor import extract_keywords
import json
from app.services.notification_service import send_counseling_log_registered_notification

# 예약ID로 상담일지 단건 조회 (직접입력 내담자용)
def get_log_by_booking(db: Session, booking_id: int, counselor_id: int):
    return db.query(CounselingLog).filter(
        CounselingLog.booking_id == booking_id,
        CounselingLog.counselor_id == counselor_id
    ).first()

# 특정 내담자의 모든 일지 조회
def get_client_logs(db: Session, client_id: int, counselor_id: int):
    return db.query(CounselingLog).filter(
        CounselingLog.client_id == client_id,
        CounselingLog.counselor_id == counselor_id
    ).order_by(CounselingLog.session_number.desc()).all()


# 일지 생성
def create_log(db: Session, data: CounselingLogCreate, counselor_id: int):
    # 💡 1. 일지 본문(content)에서 자동으로 키워드 3개 추출
    auto_keywords = extract_keywords(data.content, top_n=3)

    log_dict = data.dict(exclude_unset=True)
    
    # 💡 2. 이제 DB 모델에 keywords가 존재하므로 당당하게 함께 매핑해 줍니다!
    db_log = CounselingLog(
        booking_id=log_dict["booking_id"],
        client_id=log_dict.get("client_id"),
        counselor_id=counselor_id,
        title=log_dict["title"],
        session_number=log_dict.get("session_number", 1),
        content=log_dict["content"],
        summary=log_dict.get("summary"),
        action_plan=log_dict.get("action_plan"),
        quick_memo=log_dict.get("quick_memo"),
        keywords=auto_keywords  # ★ 추출된 리스트를 모델 필드에 직접 대입!
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    # 알림: 내담자에게 상담일지 등록 알림
    if db_log.client_id:
        from app.models.user import User
        counselor = db.query(User).filter(User.id == db_log.counselor_id).first()
        send_counseling_log_registered_notification(
            db,
            client_id=db_log.client_id,
            counselor_name=counselor.full_name if counselor else '',
            session_number=db_log.session_number
        )
    return db_log


# 일지 수정
def update_log(db: Session, log_id: int, content: str, summary: str, action_plan: str, counselor_id: int):
    db_log = db.query(CounselingLog).filter(CounselingLog.id == log_id, CounselingLog.counselor_id == counselor_id).first()
    if db_log:
        db_log.content = content
        db_log.summary = summary
        db_log.action_plan = action_plan
        # 💡 3. 일지가 수정되면 수정된 본문을 기반으로 키워드도 새로 추출해서 갱신합니다.
        db_log.keywords = extract_keywords(content, top_n=3)
        db.commit()
        db.refresh(db_log)
    return db_log


# 일지 삭제
def delete_log(db: Session, log_id: int, counselor_id: int):
    db_log = db.query(CounselingLog).filter(CounselingLog.id == log_id, CounselingLog.counselor_id == counselor_id).first()
    if db_log:
        db.delete(db_log)
        db.commit()
        return True
    return False