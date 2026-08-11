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
    recv_doctor_id    INT NULL,
    recv_dept_id      INT NULL,
    accept_doctor_id  INT NULL,
    patient_id        INT NOT NULL,
    pacs_study_id     INT NOT NULL,
    report_id         INT NULL,
    req_content       TEXT NOT NULL,
    status            ENUM('요청','수락','거절','취소','만료') NOT NULL DEFAULT '요청',
    req_time          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resp_time         DATETIME NULL,
    reject_reason     TEXT NULL,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    read_time         DATETIME NULL,
 
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;