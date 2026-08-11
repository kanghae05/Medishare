-- PACS 환자 테이블
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
);


-- PACS 검사(Study) 테이블
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
);


-- PACS 시리즈(Series) 테이블
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
);


-- 회원 연동 후 판독소견서 테이블
CREATE TABLE report (
    no BIGINT NOT NULL AUTO_INCREMENT,

    study_no BIGINT NOT NULL,
    member_id VARCHAR(255) NOT NULL,

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
        REFERENCES member(id)
);


-- 협진 요청 테이블
CREATE TABLE coop_request (
    coop_request_id   INT AUTO_INCREMENT PRIMARY KEY,
    req_doctor_id     INT NOT NULL,
    recv_type         ENUM('지정의사','진료과') NOT NULL,
    recv_doctor_id    INT,
    recv_dept_id      INT,
    accept_doctor_id  INT,
    patient_id        INT NOT NULL,
    pacs_study_id     INT NOT NULL,
    report_id         INT,
    req_content       TEXT NOT NULL,
    status            ENUM('요청','수락','거절','취소','만료') NOT NULL DEFAULT '요청',
    req_time          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resp_time         DATETIME,
    reject_reason     TEXT,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    read_time         DATETIME,
 
    CONSTRAINT chk_recv_type_match CHECK (
        (recv_type = '지정의사' AND recv_doctor_id IS NOT NULL AND recv_dept_id IS NULL)
        OR
        (recv_type = '진료과' AND recv_dept_id IS NOT NULL AND recv_doctor_id IS NULL)
    ),
    CONSTRAINT chk_req_recv_diff CHECK (req_doctor_id <> recv_doctor_id),
    CONSTRAINT chk_reject_reason CHECK (
        (status = '거절' AND reject_reason IS NOT NULL) OR (status <> '거절')
    ),
 
    FOREIGN KEY (req_doctor_id) REFERENCES doctor(doctor_id),
    FOREIGN KEY (recv_doctor_id) REFERENCES doctor(doctor_id),
    FOREIGN KEY (accept_doctor_id) REFERENCES doctor(doctor_id),
    FOREIGN KEY (recv_dept_id) REFERENCES department(dept_id),
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (pacs_study_id) REFERENCES pacs_study(study_id),
    FOREIGN KEY (report_id) REFERENCES report(report_id)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4;


-- 1. 공지사항 (Notices)
CREATE TABLE IF NOT EXISTS `notices` (
    `notice_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '공지사항 ID',
    `writer_id` BIGINT NOT NULL COMMENT '작성자 ID (users.user_id 매핑용)',
    `title` VARCHAR(255) NOT NULL COMMENT '공지 제목',
    `content` TEXT NOT NULL COMMENT '공지 본문',
    `is_pinned` TINYINT(1) DEFAULT 0 COMMENT '상단 고정 여부 (1:고정, 0:일반)',
    `views` INT DEFAULT 0 COMMENT '조회수',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '삭제 여부 (1:삭제, 0:정상)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='공지사항';


-- 2. 특이케이스 라이브러리 메인 (Special Cases)
CREATE TABLE IF NOT EXISTS `special_cases` (
    `case_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '케이스 ID',
    `writer_id` BIGINT NOT NULL COMMENT '작성자 ID (users.user_id 매핑용)',
    `title` VARCHAR(255) NOT NULL COMMENT '제목',
    `modality` VARCHAR(20) NOT NULL COMMENT '촬영 장비 (CT, MRI 등)',
    `body_part` VARCHAR(50) NOT NULL COMMENT '촬영 부위',
    `disease_code` VARCHAR(20) NULL COMMENT '질환 코드',
    `findings` TEXT NOT NULL COMMENT '판독 소견',
    `impression` TEXT NOT NULL COMMENT '최종 결론',
    `thumbnail_url` VARCHAR(500) NULL COMMENT '대표 썸네일 URL',
    `views` INT DEFAULT 0 COMMENT '조회수',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '삭제 여부 (1:삭제, 0:정상)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='특이케이스 라이브러리';


-- 3. PACS 연동 키 (PACS Links)
CREATE TABLE IF NOT EXISTS `case_pacs_links` (
    `pacs_link_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'PACS 연동 ID',
    `case_id` BIGINT NOT NULL COMMENT '케이스 ID',
    `study_instance_uid` VARCHAR(128) NOT NULL COMMENT 'PACS Study Instance UID',
    `series_instance_uid` VARCHAR(128) NULL COMMENT 'PACS Series Instance UID',
    `patient_id_masked` VARCHAR(50) NULL COMMENT '비식별 환자 ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '연동 일시',
    CONSTRAINT `fk_pacs_case` FOREIGN KEY (`case_id`) REFERENCES `special_cases` (`case_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='PACS 연동 식별키';


-- 4. 케이스 태그 (Case Tags)
CREATE TABLE IF NOT EXISTS `case_tags` (
    `tag_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '태그 ID',
    `case_id` BIGINT NOT NULL COMMENT '케이스 ID',
    `tag_name` VARCHAR(50) NOT NULL COMMENT '태그명',
    CONSTRAINT `fk_tags_case` FOREIGN KEY (`case_id`) REFERENCES `special_cases` (`case_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='검색 태그';


----------------------회원 테이블 생성 후
-- 공지사항 작성자에 회원 외래키 연결
ALTER TABLE `notices`
ADD CONSTRAINT `fk_notices_writer` 
FOREIGN KEY (`writer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

-- 특이케이스 작성자에 회원 외래키 연결
ALTER TABLE `special_cases`
ADD CONSTRAINT `fk_cases_writer` 
FOREIGN KEY (`writer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;