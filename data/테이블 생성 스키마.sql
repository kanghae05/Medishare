-- ============================================================
-- 0. DB 초기화
-- ============================================================
DROP DATABASE IF EXISTS medi;
CREATE DATABASE medi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medi;


-- ============================================================
-- 1. 진료과
-- ============================================================
CREATE TABLE department (
    no BIGINT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    stable BOOLEAN,

    PRIMARY KEY (no),
    UNIQUE KEY uk_department_name (department_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 2. 회원 (의사/관리자 등 전체 계정)
-- ============================================================
CREATE TABLE member (
    no BIGINT NOT NULL AUTO_INCREMENT,
    login_id VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    member_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(30),
    department_no BIGINT,
    position VARCHAR(100),
    specialty VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    stable BOOLEAN,

    PRIMARY KEY (no),
    UNIQUE KEY uk_member_login_id (login_id),
    UNIQUE KEY uk_member_email (email),

    CONSTRAINT fk_member_department
        FOREIGN KEY (department_no)
        REFERENCES department(no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 3. 역할 / 권한
-- ============================================================
CREATE TABLE role (
    no BIGINT NOT NULL AUTO_INCREMENT,
    role_code VARCHAR(50) NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    stable BOOLEAN,

    PRIMARY KEY (no),
    UNIQUE KEY uk_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE member_roles (
    member_no BIGINT NOT NULL,
    role_no BIGINT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (member_no, role_no),

    CONSTRAINT fk_member_role_member
        FOREIGN KEY (member_no)
        REFERENCES member(no),

    CONSTRAINT fk_member_role_role
        FOREIGN KEY (role_no)
        REFERENCES role(no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE permission (
    no BIGINT NOT NULL AUTO_INCREMENT,
    permission_code VARCHAR(100) NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    stable BOOLEAN,

    PRIMARY KEY (no),
    UNIQUE KEY uk_permission_code (permission_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE role_permission (
    role_no BIGINT NOT NULL,
    permission_no BIGINT NOT NULL,

    PRIMARY KEY (role_no, permission_no),

    CONSTRAINT fk_role_permission_role
        FOREIGN KEY (role_no)
        REFERENCES role(no),

    CONSTRAINT fk_role_permission_permission
        FOREIGN KEY (permission_no)
        REFERENCES permission(no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 4. PACS
-- ============================================================
CREATE TABLE pacs_patient (
    no BIGINT NOT NULL AUTO_INCREMENT,
    orthanc_patient_id VARCHAR(100) NOT NULL,
    patient_id VARCHAR(100),
    patient_name VARCHAR(200),
    patient_sex VARCHAR(10),
    patient_birth_date VARCHAR(20),
    stable BOOLEAN,

    PRIMARY KEY (no),
    UNIQUE KEY uk_pacs_patient_orthanc_patient_id (orthanc_patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pacs_study (
    no BIGINT NOT NULL AUTO_INCREMENT,
    orthanc_study_id VARCHAR(100) NOT NULL,
    study_instance_uid VARCHAR(128),
    accession_number VARCHAR(64),
    study_date VARCHAR(20),
    study_time VARCHAR(20),
    study_description VARCHAR(500),
    referring_physician_name VARCHAR(200),
    requested_procedure_description VARCHAR(500),
    study_id VARCHAR(64),
    stable BOOLEAN,
    series_count INT,
    instance_count INT,
    patient_no BIGINT NOT NULL,

    PRIMARY KEY (no),
    UNIQUE KEY uk_pacs_study_orthanc_study_id (orthanc_study_id),
    UNIQUE KEY uk_pacs_study_study_instance_uid (study_instance_uid),

    CONSTRAINT fk_pacs_study_patient
        FOREIGN KEY (patient_no)
        REFERENCES pacs_patient(no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pacs_series (
    no BIGINT NOT NULL AUTO_INCREMENT,
    orthanc_series_id VARCHAR(100) NOT NULL,
    series_instance_uid VARCHAR(128) NOT NULL,
    modality VARCHAR(20),
    series_description VARCHAR(500),
    series_number VARCHAR(20),
    instance_count INT NOT NULL DEFAULT 0,
    study_no BIGINT NOT NULL,

    PRIMARY KEY (no),
    UNIQUE KEY uk_pacs_series_orthanc_series_id (orthanc_series_id),
    UNIQUE KEY uk_pacs_series_series_instance_uid (series_instance_uid),

    CONSTRAINT fk_pacs_series_study
        FOREIGN KEY (study_no)
        REFERENCES pacs_study(no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 5. 판독소견서
-- ============================================================
CREATE TABLE report (
    no BIGINT NOT NULL AUTO_INCREMENT,

    study_no BIGINT NOT NULL,
    member_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,
    findings LONGTEXT NOT NULL,
    impression LONGTEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'DRAFT',

    write_date DATETIME,
    update_date DATETIME,

    PRIMARY KEY (no),

    INDEX idx_report_study_no (study_no),
    INDEX idx_report_member_id (member_id),

    CONSTRAINT fk_report_study
        FOREIGN KEY (study_no)
        REFERENCES pacs_study(no),

    CONSTRAINT fk_report_member
        FOREIGN KEY (member_id)
        REFERENCES member(no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 6. 공지사항 / 특이케이스 라이브러리
-- ============================================================
CREATE TABLE notices (
    notice_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '공지사항 ID',
    writer_id BIGINT NOT NULL COMMENT '작성자 ID (member.no 매핑)',
    title VARCHAR(255) NOT NULL COMMENT '공지 제목',
    content TEXT NOT NULL COMMENT '공지 본문',
    is_pinned TINYINT(1) DEFAULT 0 COMMENT '상단 고정 여부 (1:고정, 0:일반)',
    views INT DEFAULT 0 COMMENT '조회수',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '삭제 여부 (1:삭제, 0:정상)',

    CONSTRAINT fk_notices_writer
        FOREIGN KEY (writer_id) REFERENCES member(no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='공지사항';

CREATE TABLE special_cases (
    case_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '케이스 ID',
    writer_id BIGINT NOT NULL COMMENT '작성자 ID (member.no 매핑)',
    title VARCHAR(255) NOT NULL COMMENT '제목',
    modality VARCHAR(20) NOT NULL COMMENT '촬영 장비 (CT, MRI 등)',
    body_part VARCHAR(50) NOT NULL COMMENT '촬영 부위',
    disease_code VARCHAR(20) NULL COMMENT '질환 코드',
    findings TEXT NOT NULL COMMENT '판독 소견',
    impression TEXT NOT NULL COMMENT '최종 결론',
    thumbnail_url VARCHAR(500) NULL COMMENT '대표 썸네일 URL',
    views INT DEFAULT 0 COMMENT '조회수',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '삭제 여부 (1:삭제, 0:정상)',

    CONSTRAINT fk_cases_writer
        FOREIGN KEY (writer_id) REFERENCES member(no) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='특이케이스 라이브러리';

CREATE TABLE case_pacs_links (
    pacs_link_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'PACS 연동 ID',
    case_id BIGINT NOT NULL COMMENT '케이스 ID',
    study_instance_uid VARCHAR(128) NOT NULL COMMENT 'PACS Study Instance UID',
    series_instance_uid VARCHAR(128) NULL COMMENT 'PACS Series Instance UID',
    patient_id_masked VARCHAR(64) NULL COMMENT 'SHA-256 비식별 환자 ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '연동 일시',
    CONSTRAINT fk_pacs_case FOREIGN KEY (case_id) REFERENCES special_cases (case_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PACS 연동 식별키';

CREATE TABLE case_tags (
    tag_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '태그 ID',
    case_id BIGINT NOT NULL COMMENT '케이스 ID',
    tag_name VARCHAR(50) NOT NULL COMMENT '태그명',
    CONSTRAINT fk_tags_case FOREIGN KEY (case_id) REFERENCES special_cases (case_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='검색 태그';


-- ============================================================
-- 7. 의료 데이터 접근/변경 이력
-- ============================================================
CREATE TABLE data_access_log (
    no BIGINT NOT NULL AUTO_INCREMENT,
    member_no BIGINT NOT NULL,
    patient_no BIGINT,
    study_no BIGINT,
    data_type VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    access_result VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45),
    accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (no),

    CONSTRAINT fk_data_access_log_member
        FOREIGN KEY (member_no) REFERENCES member(no),

    CONSTRAINT fk_data_access_log_patient
        FOREIGN KEY (patient_no) REFERENCES pacs_patient(no),

    CONSTRAINT fk_data_access_log_study
        FOREIGN KEY (study_no) REFERENCES pacs_study(no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE data_change_history (
    no BIGINT NOT NULL AUTO_INCREMENT,
    member_no BIGINT NOT NULL,
    patient_no BIGINT,
    study_no BIGINT,
    data_type VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    before_data TEXT,
    after_data TEXT,
    change_reason VARCHAR(500),
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (no),

    CONSTRAINT fk_data_change_history_member
        FOREIGN KEY (member_no) REFERENCES member(no),

    CONSTRAINT fk_data_change_history_patient
        FOREIGN KEY (patient_no) REFERENCES pacs_patient(no),

    CONSTRAINT fk_data_change_history_study
        FOREIGN KEY (study_no) REFERENCES pacs_study(no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- 8. 협진요청
-- ============================================================
CREATE TABLE coop_request (
    coop_request_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    req_doctor_id		  BIGINT NOT NULL,
    recv_type          ENUM('지정의사','진료과') NOT NULL,
    recv_doctor_id     BIGINT NULL,
    recv_dept_id       BIGINT NULL,
    accept_doctor_id   BIGINT NULL,
    pacs_study_id      BIGINT NOT NULL,
    report_id          BIGINT NULL,
    origin_request_id  BIGINT NULL,
    req_content        TEXT NOT NULL,
    status             ENUM('요청','수락','거절','취소','만료') NOT NULL DEFAULT '요청',
    req_time           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resp_time          DATETIME NULL,
    reject_reason      TEXT NULL,
    is_read            BOOLEAN NOT NULL DEFAULT FALSE,
    read_time          DATETIME NULL,

    CONSTRAINT chk_recv_type_match CHECK (
        (recv_type = '지정의사' AND recv_doctor_id IS NOT NULL AND recv_dept_id IS NULL)
        OR
        (recv_type = '진료과' AND recv_dept_id IS NOT NULL AND recv_doctor_id IS NULL)
    ),
    CONSTRAINT chk_req_recv_diff CHECK (req_doctor_id <> recv_doctor_id),
    CONSTRAINT chk_reject_reason CHECK (
        (status = '거절' AND reject_reason IS NOT NULL) OR (status <> '거절')
    ),

    FOREIGN KEY (req_doctor_id) REFERENCES member(no),
    FOREIGN KEY (recv_doctor_id) REFERENCES member(no),
    FOREIGN KEY (accept_doctor_id) REFERENCES member(no),
    FOREIGN KEY (recv_dept_id) REFERENCES department(NO),
    FOREIGN KEY (pacs_study_id) REFERENCES pacs_study(no),
    FOREIGN KEY (report_id) REFERENCES report(no),
    FOREIGN KEY (origin_request_id) REFERENCES coop_request(coop_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE coop_request_dept_reject (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    coop_request_id   BIGINT NOT NULL,
    doctor_id         BIGINT NOT NULL,
    reject_reason     TEXT NOT NULL,
    rejected_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (coop_request_id, doctor_id),

    FOREIGN KEY (coop_request_id) REFERENCES coop_request(coop_request_id),
    FOREIGN KEY (doctor_id) REFERENCES member(no)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4;


-- ============================================================
-- 9. 의사 일정
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_schedules (
    schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '일정 ID',
    doctor_id BIGINT NOT NULL COMMENT '의료진 ID',
    schedule_date DATE NOT NULL COMMENT '일정 날짜',
    start_time TIME NOT NULL COMMENT '일정 시작 시간',
    end_time TIME NOT NULL COMMENT '일정 종료 시간',
    schedule_type VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' COMMENT 'AVAILABLE / RESERVED / UNAVAILABLE',
    memo VARCHAR(500) NULL COMMENT '일정 메모',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '삭제 여부',

    INDEX idx_schedule_doctor (doctor_id),
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_schedule_doctor_date (doctor_id, schedule_date),
    INDEX idx_schedule_type (schedule_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
