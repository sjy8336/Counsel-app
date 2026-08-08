# counsel-app

`frontend/`에 있는 Vite + React 애플리케이션입니다.

## 프로젝트 정보

- 프레임워크: React
- 번들러: Vite
- 라우팅: React Router
- HTTP 클라이언트: Axios
- 아이콘: lucide-react
- 결제 SDK: `@tosspayments/payment-sdk`

## 실행 방법

```bash
cd frontend
npm install
npm run dev
```

## 빌드 및 확인

```bash
cd frontend
npm run build
npm run preview
npm run lint
```

## 환경 변수

`frontend/vite.config.js`에서는 `VITE_API_BASE_URL`을 읽어서 `/api`와 `/static` 요청을 프록시합니다.

기본값은 `http://localhost:8000`입니다.

## 주요 라우트

- `/`
- `/login`
- `/signup`
- `/find-password`
- `/mypage`
- `/notifications`
- `/reserve`
- `/reservation`
- `/counselors`
- `/counselor/:id`
- `/CounselorMyPage`
- `/counselorUpload`
- `/diary`
- `/CounselorPlanner`
- `/CounselorClient`
- `/counselorhome`
- `/AIdiary`
- `/ai-diary`
- `/survey`
- `/payment`
- `/payment/success`
- `/payment/fail`
- `/CounselorMessages`
- `/contact-coach`
- `/healing`
- `/admin`

## 폴더 구조

- `frontend/src/pages`: 페이지 컴포넌트
- `frontend/src/components`: 공통 컴포넌트
- `frontend/src/api`: API 호출 파일
- `frontend/src/static`: CSS 파일
- `frontend/src/utils`: 유틸 함수
- `frontend/public`: 정적 파일

## 동작 방식

- `frontend/src/App.jsx`에서 라우트를 관리합니다.
- `frontend/src/App.jsx`는 `access_token`, `user`, `login_time`을 `localStorage`에서 읽습니다.
- `frontend/src/App.jsx`의 `/admin` 경로는 `role === 'admin'`인 사용자만 접근하도록 처리되어 있습니다.
