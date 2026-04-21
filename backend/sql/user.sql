CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL COMMENT '이름',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '아이디',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '이메일',
    hashed_password VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호',
    phone_number VARCHAR(20) NOT NULL COMMENT '전화번호',
    role ENUM('client', 'counselor', 'admin') DEFAULT 'client' COMMENT '역할(내담자, 상담사, 관리자)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
);

SELECT * From users;
Commit;
CREATE USER 'mindwell_user'@'%' IDENTIFIED BY '062206';
GRANT ALL PRIVILEGES ON mindwell_db.* TO 'mindwell_user'@'%';
FLUSH PRIVILEGES;

SELECT user, host FROM mysql.user WHERE user = 'mindwell_user';

GRANT ALL PRIVILEGES ON counseling_db.* TO 'mindwell_user'@'%';