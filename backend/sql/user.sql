DROP TABLE IF EXISTS users;

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

DELETE FROM users WHERE id = 2;

Commit;
CREATE USER 'mindwell_user'@'%' IDENTIFIED BY '062206';
GRANT ALL PRIVILEGES ON mindwell_db.* TO 'mindwell_user'@'%';
FLUSH PRIVILEGES;

SELECT user, host FROM mysql.user WHERE user = 'mindwell_user';

GRANT ALL PRIVILEGES ON counseling_db.* TO 'mindwell_user'@'%';
FLUSH PRIVILEGES;

ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;



