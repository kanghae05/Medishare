package com.medishare.api.coop.vo;

import lombok.Data;

/** 협진 상세화면에서 보여줄 검사/환자 상세 정보 */
@Data
public class StudyDetailVO {
    // 환자 정보
    private Long patientNo;
    private String patientIdText; // DICOM PatientID (문자열, pacs_patient.patient_id)
    private String patientName;
    private String patientSex;
    private Integer age; // 생년월일 기준으로 서버에서 계산 (만 나이)

    // 검사 정보
    private Long studyNo;
    private String accessionNumber;
    private String studyDate;
    private String studyTime;
    private String studyDescription;
    private String referringPhysicianName;
    private String requestedProcedureDescription;
    private Integer instanceCount;
    private Integer seriesCount;

    // 시리즈 정보 (검사당 시리즈 1개 전제)
    private String modality;
    private String seriesDescription;

    // 기술 정보 (평소엔 화면에서 접어두고, 필요할 때만 펼쳐보는 용도)
    private String orthancStudyId;
    private String studyInstanceUid;
    private String orthancPatientId;
}