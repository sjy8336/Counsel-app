# mini_mind counsel-app 프로젝트 기능 문서

## 1. 프로젝트 개요

counsel-app은 내담자와 상담사를 연결하는 심리상담 플랫폼입니다.
사용자 인증, 상담사 탐색/찜, 예약/결제, 상담기록, 문의/알림, AI 감정일기, 관리자 승인 기능을 통합 제공합니다.

---

## 2. 기술 스택

| 구분     | 스택                                      |
| -------- | ----------------------------------------- |
| Backend  | FastAPI, Python                           |
| ORM/DB   | SQLAlchemy, MySQL(SQLite 개발환경 일부)   |
| Frontend | React, Vite, JavaScript                   |
| Auth     | JWT(access_token), localStorage 기반 세션 |
| Payment  | Toss Payments API(결제 승인 연동)         |
| AI       | OpenAI 기반 감정일기 분석 유틸            |
| Static   | FastAPI StaticFiles(`/static`)            |

---

## 3. 핵심 기능

- 계정/인증: 회원가입, 로그인, 내 정보 조회, 프로필 수정, 비밀번호 변경, 탈퇴
- 역할 기반 접근: client/counselor/admin 권한 분기
- 상담사 도메인:
    - 상담사 프로필 등록/수정/조회
    - 전문분야/학력/경력/자격증/일정 관리
    - 승인 상담사 목록 조회, 상세 조회
- 예약 도메인:
    - 예약 생성, 결제 후 확정, 거절/취소/삭제/완료 처리
    - 예약 목록 조회(역할별)
    - 예약 불가 시간/휴무일 관리
- 사용자 경험:
    - 상담사 목록 검색/필터/상세 이동
    - 찜(좋아요) 추가/해제/목록
    - 알림 목록 조회/읽음 처리
    - 문의 생성/조회/답변
- 상담기록:
    - 상담기록 생성/수정/삭제/조회
    - client/counselor 권한 검사 기반 조회 제한
- AI 감정일기:
    - 일기 분석/저장
    - 최근 분석 내역 조회
- 관리자 기능:
    - 상담사 승인/반려
    - 전체 회원 조회(가입일/상태/기본 정보)

---

## 4. API 엔드포인트(주요)

## 4.1 인증/사용자

| Method | Path                      | 설명                    | 인증 |
| ------ | ------------------------- | ----------------------- | ---- |
| POST   | /api/signup               | 회원가입                | 선택 |
| POST   | /api/login                | 로그인(JWT 발급)        | 선택 |
| GET    | /api/check-id/{username}  | 아이디 중복 확인        | 선택 |
| GET    | /api/me                   | 현재 로그인 사용자 조회 | 필요 |
| GET    | /api/user/{user_id}       | 사용자 정보 조회        | 필요 |
| POST   | /api/user/update          | 사용자 프로필 수정      | 필요 |
| POST   | /api/user/change-password | 비밀번호 변경           | 필요 |
| POST   | /api/delete-account       | 계정 비활성화(탈퇴)     | 필요 |

## 4.2 상담사/관리자

| Method | Path                                    | 설명                  | 인증        |
| ------ | --------------------------------------- | --------------------- | ----------- |
| GET    | /api/counselors/approved                | 승인된 상담사 목록    | 선택        |
| GET    | /api/counselors/{user_id}               | 상담사 상세 조회      | 선택        |
| POST   | /api/counselor/profile                  | 상담사 프로필 등록    | 필요        |
| GET    | /api/counselor/profile                  | 상담사 프로필 조회    | 필요        |
| PUT    | /api/counselor/profile                  | 상담사 프로필 수정    | 필요        |
| PUT    | /api/counselor/specialty                | 전문분야 수정         | 필요        |
| PUT    | /api/counselor/education                | 학력 수정             | 필요        |
| PUT    | /api/counselor/experience               | 경력 수정             | 필요        |
| PUT    | /api/counselor/certificate              | 자격증 수정           | 필요        |
| PUT    | /api/counselor/schedule                 | 근무 일정 수정        | 필요        |
| GET    | /api/admin/counselors/pending           | 승인 대기 상담사 조회 | 필요(admin) |
| PATCH  | /api/admin/counselors/{user_id}/approve | 상담사 승인           | 필요(admin) |
| PATCH  | /api/admin/counselors/{user_id}/reject  | 상담사 반려           | 필요(admin) |
| GET    | /api/admin/users                        | 전체 회원 조회        | 필요(admin) |

## 4.3 예약/결제/일정

| Method | Path                             | 설명                   | 인증            |
| ------ | -------------------------------- | ---------------------- | --------------- |
| POST   | /api/booking/create              | 예약 생성              | 필요            |
| POST   | /api/booking/confirm             | 예약 확정              | 필요            |
| POST   | /api/booking/reject              | 예약 거절              | 필요(counselor) |
| GET    | /api/booking/list                | 예약 목록 조회         | 필요            |
| DELETE | /api/booking/cancel/{order_id}   | 예약 취소              | 필요            |
| DELETE | /api/booking/remove/{order_id}   | 예약 완전 삭제         | 필요            |
| POST   | /api/booking/complete/{order_id} | 상담 완료 처리         | 필요            |
| GET    | /api/booking/reserved-times      | 예약된 시간 조회       | 선택            |
| POST   | /api/payment/confirm             | 결제 승인 및 상태 반영 | 필요            |
| POST   | /api/schedule                    | 근무 일정 추가         | 필요(counselor) |
| GET    | /api/schedule/calendar           | 캘린더 일정 조회       | 선택            |
| GET    | /api/holiday                     | 휴무일 조회            | 선택            |
| POST   | /api/holiday                     | 휴무일 등록            | 필요            |
| DELETE | /api/holiday                     | 휴무일 삭제            | 필요            |
| POST   | /api/blocked-slot                | 예약 불가 시간 등록    | 필요(counselor) |
| GET    | /api/blocked-slot                | 예약 불가 시간 조회    | 필요            |
| DELETE | /api/blocked-slot/{block_id}     | 예약 불가 시간 삭제    | 필요            |

## 4.4 부가 기능(찜/알림/문의/AI)

| Method | Path                               | 설명                 | 인증                  |
| ------ | ---------------------------------- | -------------------- | --------------------- |
| POST   | /api/favorites/{counselor_id}      | 찜 토글(추가/해제)   | 필요                  |
| GET    | /api/favorites                     | 찜 목록 조회         | 필요                  |
| GET    | /api/notifications                 | 알림 목록 조회       | 필요                  |
| POST   | /api/notifications/{notif_id}/read | 알림 읽음 처리       | 필요                  |
| GET    | /api/inquiries/my                  | 내 문의 조회         | 필요                  |
| GET    | /api/inquiries/received            | 접수 문의 조회       | 필요(counselor)       |
| POST   | /api/inquiries/create              | 문의 생성            | 필요                  |
| PUT    | /api/inquiries/{inquiry_id}/reply  | 문의 답변            | 필요(counselor/admin) |
| POST   | /api/ai-diary/analyze              | AI 일기 분석/저장    | 필요                  |
| GET    | /api/ai-diary/recent               | 최근 AI 일기 조회    | 필요                  |
| POST   | /api/upload/profile-image          | 프로필 이미지 업로드 | 필요                  |

---

## 5. 화면 라우트(주요)

| Path                   | 설명                              |
| ---------------------- | --------------------------------- |
| /                      | 홈                                |
| /login                 | 로그인                            |
| /signup                | 회원가입                          |
| /mypage                | 내담자 마이페이지                 |
| /notifications         | 알림 진입(역할별 마이페이지 분기) |
| /counselors            | 상담사 목록                       |
| /counselor/:id         | 상담사 상세                       |
| /reservation, /reserve | 예약 페이지                       |
| /payment               | 결제                              |
| /payment/success       | 결제 성공                         |
| /payment/fail          | 결제 실패                         |
| /ai-diary, /AIdiary    | AI 감정일기                       |
| /CounselorHome         | 상담사 홈                         |
| /CounselorMyPage       | 상담사 마이페이지                 |
| /CounselorPlanner      | 상담사 일정 관리                  |
| /CounselorClient       | 상담사 내담자 관리                |
| /CounselorMessages     | 상담사 메시지                     |
| /admin/counselors      | 관리자 상담사 승인(Protected)     |

---

## 6. 데이터 모델(핵심)

| 모델                 | 설명                           |
| -------------------- | ------------------------------ |
| User                 | 사용자 계정/권한/프로필 이미지 |
| CounselorProfile     | 상담사 프로필 기본 정보        |
| CounselorSpecialty   | 전문분야                       |
| CounselorEducation   | 학력                           |
| CounselorExperience  | 경력                           |
| CounselorCertificate | 자격증                         |
| CounselorSchedule    | 근무 가능 일정                 |
| Booking              | 상담 예약/상태                 |
| Favorite             | 내담자 찜 목록                 |
| Notification         | 시스템 알림                    |
| Inquiry              | 문의/답변                      |
| Holiday              | 휴무일                         |
| BlockedSlot          | 예약 불가 시간                 |
| CounselingLog        | 상담기록                       |
| AIDiaryModel         | AI 감정일기 분석 결과          |

---

## 7. 프로젝트 구조(Tree)

```text
counsel-app/
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ static/
│  │  ├─ utils/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  └─ package.json
├─ backend/
│  ├─ app/
│  │  ├─ api/
│  │  ├─ core/
│  │  ├─ crud/
│  │  ├─ db/
│  │  ├─ models/
│  │  ├─ schemas/
│  │  ├─ services/
│  │  ├─ static/
│  │  ├─ utils/
│  │  └─ main.py
│  └─ requirements.txt
├─ README.md
├─ PROJECT_GUIDE.txt
└─ PROJECT_FEATURES.md
```

---

## 8. 기능별 사용 기술 요약

| 기능                   | 사용 기술                            | 요약                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| 인증/권한              | FastAPI, JWT, deps(get_current_user) | 토큰 기반 로그인과 역할별 접근 제어를 수행합니다.                       |
| 상담사 승인 워크플로우 | FastAPI Router, SQLAlchemy           | 상담사 등록 후 관리자 승인/반려 플로우를 제공합니다.                    |
| 예약/결제              | Booking API, Toss 결제 승인 API      | 예약 생성부터 결제 승인, 상태 전이(확정/거절/완료/취소)까지 처리합니다. |
| 이미지 처리            | Upload API, StaticFiles              | 프로필 이미지를 업로드하고 `/static` URL로 서빙합니다.                  |
| 상담기록 권한보호      | counseling_log API + role 체크       | 내담자/상담사만 해당 기록 접근 가능하도록 제한합니다.                   |
| 문의/알림              | Inquiry, Notification API            | 문의 생성-답변, 알림 조회-읽음 처리 흐름을 제공합니다.                  |
| AI 감정일기            | AI Advisor 유틸, Diary API           | 감정/강도/스트레스 입력을 분석하여 리포트를 저장/조회합니다.            |
| 관리자 회원 조회       | /api/admin/users + 프론트 테이블     | 회원 상태/역할/가입일 등 운영 데이터를 조회합니다.                      |
