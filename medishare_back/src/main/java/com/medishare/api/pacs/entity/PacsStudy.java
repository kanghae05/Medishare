package com.medishare.api.pacs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pacs_study")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacsStudy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private Long no;


    @Column(
            name = "orthanc_study_id",
            length = 100,
            unique = true,
            nullable = false
    )
    private String orthancStudyId;


    @Column(
            name = "study_instance_uid",
            length = 128,
            unique = true
    )
    private String studyInstanceUID;


    @Column(
            name = "accession_number",
            length = 64
    )
    private String accessionNumber;


    @Column(
            name = "study_date",
            length = 20
    )
    private String studyDate;


    @Column(
            name = "study_time",
            length = 20
    )
    private String studyTime;


    @Column(
            name = "study_description",
            length = 500
    )
    private String studyDescription;


    @Column(
            name = "referring_physician_name",
            length = 200
    )
    private String referringPhysicianName;


    @Column(
            name = "requested_procedure_description",
            length = 500
    )
    private String requestedProcedureDescription;


    @Column(
            name = "study_id",
            length = 64
    )
    private String studyID;


    @Column(name = "stable")
    private Boolean stable;


    @Column(name = "series_count")
    @Builder.Default
    private Integer seriesCount = 0;


    @Column(name = "instance_count")
    @Builder.Default
    private Integer instanceCount = 0;


    // 환자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "patient_no",
            nullable = false
    )
    private PacsPatient patient;


    // Study에 포함된 Series
    @OneToMany(
            mappedBy = "study",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PacsSeries> seriesList =
            new ArrayList<>();
}