package com.medishare.api.coop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private Long no;

    private String orthancStudyId;

    private String studyDescription;

    private String studyDate;

    private Long patientNo;

    protected PacsStudyRef() {
    }
}