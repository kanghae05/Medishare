package com.medishare.api.coop.entity;

import jakarta.persistence.*;
import lombok.Getter;

/**
 * pacs_study 테이블을 읽기 전용으로 참조하는 임시 엔티티.
 *
 * TODO(PACS 담당자 연동): PACS 팀이 정식 검사 조회 API를 공개하면 이 엔티티와
 * PacsStudyRefRepository는 삭제하고, 그 API를 호출하는 방식으로 교체한다.
 * 그 전까지는 협진(coop) 화면에 검사 설명/촬영일/Orthanc 검사ID를 보여주기 위한
 * 최소한의 조회 용도로만 사용하며, 절대 이 엔티티로 pacs_study를 수정하지 않는다.
 */
@Entity
@Table(name = "pacs_study")
@Getter
public class PacsStudyRef {

    @Id
    @Column(name = "no")
    private Long no;

    @Column(name = "orthanc_study_id")
    private String orthancStudyId;

    @Column(name = "study_description")
    private String studyDescription;

    @Column(name = "study_date")
    private String studyDate;

    @Column(name = "patient_no")
    private Long patientNo;

    protected PacsStudyRef() {
    }
}
