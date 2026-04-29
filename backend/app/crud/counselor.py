from sqlalchemy.orm import Session
from app.models.counselor import (
    CounselorProfile, CounselorSpecialty, CounselorExperience, CounselorEducation, CounselorSchedule
)
from app.models.user import User
from app.schemas.counselor import (
    CounselorFullProfileCreate, CounselorProfileCreate, CounselorSpecialtyCreate,
    CounselorExperienceCreate, CounselorEducationCreate, CounselorScheduleCreate
)

def create_counselor_full_profile(db: Session, user_id: int, data: CounselorFullProfileCreate):
    # 1. 프로필
    profile = CounselorProfile(
        user_id=user_id,
        profile_img_url=data.profile.profile_img_url,
        center_name=data.profile.center_name,
        center_address=data.profile.center_address,
        bio=data.profile.bio,
    )
    db.add(profile)
    db.flush()  # id 생성

    # 2. 전문분야
    for s in data.specialties:
        db.add(CounselorSpecialty(user_id=user_id, specialty_name=s.specialty_name))

    # 3. 경력
    for exp in data.experiences:
        db.add(CounselorExperience(
            user_id=user_id,
            company_name=exp.company_name,
            start_date=exp.start_date,
            end_date=exp.end_date,
            is_current=exp.is_current,
            description=exp.description,
        ))

    # 4. 학력
    for edu in data.educations:
        if not edu.school_name or not edu.major:
            raise ValueError("학교명과 전공은 필수입니다.")
        db.add(CounselorEducation(
            user_id=user_id,
            school_name=edu.school_name,
            major=edu.major,
            degree_type=edu.degree_type,
        ))

    # 5. 일정
        # 5. 일정
        # 한글 요일을 영어 요일 코드로 변환
        weekday_map = {
            '월': 'mon',
            '화': 'tue',
            '수': 'wed',
            '목': 'thu',
            '금': 'fri',
            '토': 'sat',
            '일': 'sun',
        }
        for sch in data.schedules:
            day_of_week = sch.day_of_week
            # 한글 요일이면 영어로 변환
            if day_of_week in weekday_map:
                day_of_week = weekday_map[day_of_week]
            db.add(CounselorSchedule(
                user_id=user_id,
                day_of_week=day_of_week,
                start_time=sch.start_time,
                end_time=sch.end_time,
                is_holiday=sch.is_holiday,
            ))

    db.commit()
    return profile
