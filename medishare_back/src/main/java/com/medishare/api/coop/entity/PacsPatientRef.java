package com.medishare.api.coop.entity;

import jakarta.persistence.*;
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
    @Column(name = "no")
    private Long no;

    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "patient_sex")
    private String patientSex;

    @Column(name = "patient_birth_date")
    private String patientBirthDate;

    protected PacsPatientRef() {
    }
}
