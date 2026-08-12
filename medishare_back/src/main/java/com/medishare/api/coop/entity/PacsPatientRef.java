package com.medishare.api.coop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

/**
 * pacs_patient 테이블을 읽기 전용으로 참조하는 임시 엔티티.
 * PacsStudyRef와 동일한 이유(TODO)로 임시로 두고, PACS 팀 API 나오면 교체한다.
 */
@Entity
@Table(name = "pacs_patient")
@Getter
public class PacsPatientRef {

    @Id
    private Long no;

    private String patientName;

    private String patientSex;

    private String patientBirthDate;

    protected PacsPatientRef() {
    }
}