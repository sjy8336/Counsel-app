DROP TABLE IF EXISTS users;

-- 회원가입 테이블 생성

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL COMMENT '이름',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '아이디',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '이메일',
    hashed_password VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    phone_number VARCHAR(20) NOT NULL COMMENT '전화번호',
    birth_date DATE NOT NULL COMMENT '생년월일',
    gender ENUM('male', 'female') NOT NULL COMMENT '성별',
    role ENUM('client', 'counselor', 'admin') DEFAULT 'client' COMMENT '역할',
    is_active TINYINT(1) DEFAULT 1 COMMENT '활성화 상태(1: 활성, 0: 비활성)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE users ADD COLUMN profile_img_url VARCHAR(255) NULL;
ALTER TABLE users MODIFY profile_img_url LONGTEXT;

SELECT * From users; 


DELETE FROM users WHERE id = 16;

INSERT INTO users (id, full_name, username, email, hashed_password, phone_number, birth_date, gender, role, is_active) 
VALUES (3, '테스터', 'test_counselor', 'test@test.com', '1234', '010-1243-4565', '2002-04-23', 'male', 'admin', 1);

Commit;

-- db 권한 수락

CREATE USER 'mindwell_user'@'%' IDENTIFIED BY '062206';
GRANT ALL PRIVILEGES ON mindwell_db.* TO 'mindwell_user'@'%';
FLUSH PRIVILEGES;


SELECT user, host FROM mysql.user WHERE user = 'mindwell_user';

GRANT ALL PRIVILEGES ON counseling_db.* TO 'mindwell_user'@'%';
FLUSH PRIVILEGES;


-- 찜 누르면 db 저장.

CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL COMMENT '찜한 내담자 ID',
    counselor_id INT NOT NULL COMMENT '찜 당한 상담사 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- 같은 상담사를 중복해서 찜할 수 없도록 유니크 설정
    UNIQUE KEY unique_favorite (client_id, counselor_id),
    -- 외래키 설정 (users 테이블의 id 참조)
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 
    f.id AS favorite_id,
    f.created_at,
    u.id AS counselor_id,
    u.full_name,    -- name에서 full_name으로 변경
    u.role,
    u.email
FROM favorites f
INNER JOIN users u ON f.counselor_id = u.id
WHERE f.client_id = 1; -- ? 자리에 내담자 ID 바인딩

Commit;

SELECT * FROM favorites;


-- 1. 상담사 기본 프로필 테이블

CREATE TABLE `counselor_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'users 테이블의 id 참조',
  `profile_img_url` longtext COMMENT '프로필 이미지 (Base64 또는 URL)',
  `intro_line` varchar(100) DEFAULT NULL COMMENT '한줄 소개 (최대 40자)',
  `center_name` varchar(100) NOT NULL COMMENT '상담소명',
  `center_phone` varchar(20) DEFAULT NULL COMMENT '상담소 전화번호',
  `center_address` varchar(255) NOT NULL COMMENT '상담소 주소',
  `consultation_price` int DEFAULT '0' COMMENT '상담 가격 (1회 기준)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('심사중','수락','반려') NOT NULL DEFAULT '심사중' COMMENT '프로필 심사 상태',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE counselor_profiles ADD COLUMN reject_reason TEXT;
ALTER TABLE counselor_profiles DROP COLUMN profile_img_url;

SELECT * From counselor_profiles;

DELETE FROM counselor_profiles WHERE user_id = 16;

commit;


-- 2. 전문 상담분야 테이블 (중복 선택 대응용)

CREATE TABLE `counselor_specialties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `specialty_name` varchar(50) NOT NULL COMMENT '분야명 (개인심리, 취업상담 등)',
  `custom_description` text COMMENT '기타 전문분야 직접 입력 내용',
  PRIMARY KEY (`id`),
  KEY `fk_specialty_user` (`user_id`),
  CONSTRAINT `fk_specialty_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * From counselor_specialties;

DELETE FROM counselor_specialties WHERE user_id = 16;


-- 3. 경력 사항 테이블 (다중 입력 대응)

CREATE TABLE `counselor_experiences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `start_date` varchar(10) NOT NULL COMMENT '시작일 (YYYY-MM)',
  `end_date` varchar(10) DEFAULT NULL COMMENT '종료일 (현재진행중이면 NULL)',
  `is_current` tinyint(1) DEFAULT '0' COMMENT '현재 진행중 여부 (1이면 진행중)',
  `content` text NOT NULL COMMENT '활동 내용 (소속 및 직책)',
  PRIMARY KEY (`id`),
  KEY `fk_exp_user` (`user_id`),
  CONSTRAINT `fk_exp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * From counselor_experiences;

DELETE FROM counselor_experiences WHERE user_id = 16;


-- 4. 학력 사항 테이블 (다중 입력 대응)

CREATE TABLE counselor_educations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    school_name VARCHAR(100) NOT NULL COMMENT '학교명',
    major VARCHAR(100) NOT NULL COMMENT '전공 및 학위',
    degree_type ENUM('bachelor', 'master', 'doctor') COMMENT '학위 종류',
    CONSTRAINT fk_edu_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT * From counselor_educations;

DELETE FROM counselor_educations WHERE user_id = 16;

commit;


-- 5. 상담 일정 설정 테이블 (달력/예약 연동용)

CREATE TABLE `counselor_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `day_of_week` enum('월요일','화요일','수요일','목요일','금요일','토요일','일요일') NOT NULL,
  `start_time` time NOT NULL COMMENT '상담 시작 시간',
  `end_time` time NOT NULL COMMENT '상담 종료 시간',
  PRIMARY KEY (`id`),
  KEY `fk_schedule_user` (`user_id`),
  CONSTRAINT `fk_schedule_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SELECT * From counselor_schedules;
DELETE FROM counselor_schedules WHERE user_id = 16;

-- 기존 holiday 테이블 삭제

DROP TABLE IF EXISTS holiday;

CREATE TABLE holiday (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  user_id INT NOT NULL,
  UNIQUE KEY uix_date_user (date, user_id),
  CONSTRAINT fk_holiday_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT * From holiday;

commit;

-- counseling_db.bookings definition

CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `counselor_id` int NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` varchar(20) NOT NULL,
  `survey_content` json DEFAULT NULL,
  `payment_status` enum('pending','completed','canceled') DEFAULT 'pending',
  `booking_status` enum('waiting','confirmed','completed','canceled') DEFAULT 'waiting',
  `amount` int DEFAULT '20000',
  `order_id` varchar(100) DEFAULT NULL,
  `payment_key` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking_slot` (`counselor_id`,`booking_date`,`booking_time`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `fk_client` (`client_id`),
  CONSTRAINT `fk_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_counselor` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE bookings
ADD COLUMN client_name VARCHAR(100) NULL AFTER counselor_id;
ALTER TABLE bookings MODIFY COLUMN client_id INT NULL;
ALTER TABLE bookings
ADD CONSTRAINT uq_counselor_date_time UNIQUE (counselor_id, booking_date, booking_time);

SELECT * From bookings;
commit;

DELETE FROM bookings WHERE id = 32;

DROP TABLE IF EXISTS counseling_logs;

CREATE TABLE counseling_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL COMMENT '어떤 예약 건에 대한 일지인지 연결',
    client_id INT NOT NULL COMMENT '내담자 유저 ID',
    counselor_id INT NOT NULL COMMENT '상담사 유저 ID',
    title VARCHAR(255) NOT NULL COMMENT '일지 제목 (예: 1회차 상담 일지)',
    session_number INT DEFAULT 1 COMMENT '상담 회차 (1, 2, 3...)',
    content LONGTEXT NOT NULL COMMENT 'cc-log-editor 입력창에 들어가는 상담 상세 내용',
    quick_memo TEXT COMMENT '우측 utility 바의 Quick Memo 내용 저장',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_booking_log (booking_id),
    CONSTRAINT fk_log_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_log_client FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_log_counselor FOREIGN KEY (counselor_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE counseling_logs ADD COLUMN keywords JSON COMMENT '자동 추출된 키워드 리스트';

ALTER TABLE counseling_logs
    ADD COLUMN summary TEXT COMMENT '상담 요약 내용' AFTER content,
    ADD COLUMN action_plan TEXT COMMENT '다음 상담까지의 실천과제' AFTER summary;

SELECT * From counseling_logs;
commit;

CREATE TABLE counselor_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL COMMENT '문의를 남긴 내담자 유저 ID',
    counselor_id INT NOT NULL COMMENT '답변을 해야 하는 상담사 유저 ID',
    type VARCHAR(50) NOT NULL COMMENT '문의 유형 (예약 변동, 사전 질문 등)',
    title VARCHAR(255) NOT NULL COMMENT '문의 제목',
    content TEXT NOT NULL COMMENT '문의 내용',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '상태 (pending: 대기중, answered: 답변완료)',
    answer TEXT NULL COMMENT '상담사의 답변 내용',
    answered_at TIMESTAMP NULL COMMENT '답변이 등록된 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counselor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT * From counselor_inquiries;
commit;

CREATE TABLE ai_diaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '일기를 작성한 내담자 ID',
    diary_text TEXT NOT NULL COMMENT '일기 본문',
    selected_emotion VARCHAR(20) NOT NULL COMMENT '선택한 감정 ID (happy, sad 등)',
    emotion_intensity INT NOT NULL COMMENT '감정 강도 (0~100)',
    stress_level INT NOT NULL COMMENT '스트레스 지수 (0~100)',
    ai_analysis TEXT NULL COMMENT 'AI가 생성한 맞춤형 공감 및 분석 리포트 문구',
    healing_title VARCHAR(100) NULL COMMENT 'AI 추천 힐링 처방 이름 (예: 따뜻한 캐모마일 차)',
    healing_desc VARCHAR(255) NULL COMMENT 'AI 추천 힐링 처방 설명',
    keywords VARCHAR(255) NULL COMMENT '일기에서 추출된 핵심 키워드 JSON 배열 (예: ["친구", "저녁"])',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE ai_diaries ADD COLUMN healing_icon VARCHAR(20);

SELECT * From ai_diaries;
commit;

DELETE FROM ai_diaries WHERE user_id = 1;


