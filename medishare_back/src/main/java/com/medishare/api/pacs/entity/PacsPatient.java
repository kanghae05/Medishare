package com.medishare.api.pacs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pacs_patient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class PacsPatient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private Long no;

    @Column(name = "orthanc_patient_id", length = 100, unique = true, nullable = false)
    private String orthancPatientId;

    @Column(name = "patient_id", length = 100)
    private String patientId;

    @Column(name = "patient_name", length = 200)
    private String patientName;

    @Column(name = "patient_sex", length = 10)
    private String patientSex;

    @Column(name = "patient_birth_date", length = 20)
    private String patientBirthDate;

    @Column(name = "stable")
    private Boolean stable;

    @OneToMany(
            mappedBy = "patient",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PacsStudy> studyList = new ArrayList<>();
}
