-- 유저 테이블
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL COMMENT '이름',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '아이디',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '이메일',
    hashed_password VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    phone_number VARCHAR(20) NOT NULL COMMENT '전화번호',
    role ENUM('client', 'counselor', 'admin') DEFAULT 'client' COMMENT '역할(내담자, 상담사, 관리자)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시'
);