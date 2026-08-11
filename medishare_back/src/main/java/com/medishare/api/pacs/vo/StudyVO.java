package com.medishare.api.pacs.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyVO {

    // PacsStudyRepository에서 바로 VO 객체로 받기 위한 생성자
    public StudyVO(
            String orthancStudyId,
            String patientId,
            String patientName,
            String patientSex,
            String patientBirthDate,
            String studyInstanceUID,
            String studyDate,
            String studyTime,
            String studyDescription,
            Integer seriesCount,
            Boolean stable) {

        this.orthancStudyId = orthancStudyId;

        this.patientId = patientId;
        this.patientName = patientName;
        this.patientSex = patientSex;
        this.patientBirthDate = patientBirthDate;

        this.studyInstanceUID = studyInstanceUID;
        this.studyDate = studyDate;
        this.studyTime = studyTime;
        this.studyDescription = studyDescription;

        this.seriesCount = seriesCount;
        this.stable = Boolean.TRUE.equals(stable);
    }

    // Orthanc Study ID
    private String orthancStudyId;

    // 환자 정보
    private String patientId;
    private String patientName;
    private String patientSex;
    private String patientBirthDate;

    // Study 정보
    private String studyInstanceUID;
    private String accessionNumber;
    private String studyDate;
    private String studyTime;
    private String studyDescription;
    private String referringPhysicianName;
    private String requestedProcedureDescription;
    private String studyID;

    // 기타
    private String parentPatient;
    private boolean stable;

    // 개수 정보
    private Integer seriesCount = 0;
    private Integer instanceCount = 0;

    // Series 정보
    private List<SeriesVO> seriesList = new ArrayList<>();
}