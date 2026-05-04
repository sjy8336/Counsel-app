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

SELECT * From users;
SELECT * FROM favorites WHERE client_id = 1;

DELETE FROM users WHERE id = 2;
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

CREATE TABLE counselor_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE COMMENT 'users 테이블의 id 참조',
    profile_img_url VARCHAR(255) COMMENT '상담사 사진 URL',
    center_name VARCHAR(100) NOT NULL COMMENT '상담소명',
    center_address VARCHAR(255) NOT NULL COMMENT '상담소 주소',
    bio TEXT COMMENT '상담사 자기소개',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT * From counselor_profiles;


-- 2. 전문 상담분야 테이블 (중복 선택 대응용)

CREATE TABLE counselor_specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialty_name VARCHAR(50) NOT NULL COMMENT '상담 분야 (예: 우울, 불안, 아동 등)',
    CONSTRAINT fk_specialty_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT * From counselor_specialties;


-- 3. 경력 사항 테이블 (다중 입력 대응)

CREATE TABLE counselor_experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(100) NOT NULL COMMENT '기관명',
    start_date DATE NOT NULL COMMENT '시작일',
    end_date DATE NULL COMMENT '종료일 (NULL이면 진행중)',
    is_current TINYINT(1) DEFAULT 0 COMMENT '현재 재직 여부',
    description TEXT COMMENT '담당 업무 상세',
    CONSTRAINT fk_exp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT * From counselor_experiences;


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


-- 5. 상담 일정 설정 테이블 (달력/예약 연동용)

CREATE TABLE counselor_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    day_of_week ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun') NOT NULL COMMENT '요일',
    start_time TIME NOT NULL COMMENT '상담 시작 시간',
    end_time TIME NOT NULL COMMENT '상담 종료 시간',
    is_holiday TINYINT(1) DEFAULT 0 COMMENT '해당 요일 휴무 여부',
    CONSTRAINT fk_schedule_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT * From counselor_schedules;
DELETE FROM counselor_schedules WHERE user_id = 2;

commit;

