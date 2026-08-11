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
    private Long no;

    @Column(length = 100, unique = true, nullable = false)
    private String orthancStudyId;

    @Column(length = 128, unique = true)
    private String studyInstanceUID;

    @Column(length = 64)
    private String accessionNumber;

    @Column(length = 20)
    private String studyDate;

    @Column(length = 20)
    private String studyTime;

    @Column(length = 500)
    private String studyDescription;

    @Column(length = 200)
    private String referringPhysicianName;

    @Column(length = 500)
    private String requestedProcedureDescription;

    @Column(length = 64)
    private String studyID;

    private Boolean stable;

    private Integer seriesCount = 0;

    private Integer instanceCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_no", nullable = false)
    private PacsPatient patient;

    @OneToMany(
            mappedBy = "study",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<PacsSeries> seriesList = new ArrayList<>();
}