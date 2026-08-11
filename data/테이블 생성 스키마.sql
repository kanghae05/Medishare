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