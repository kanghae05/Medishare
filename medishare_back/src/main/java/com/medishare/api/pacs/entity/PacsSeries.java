package com.medishare.api.pacs.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pacs_series")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacsSeries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @Column(name = "orthanc_series_id", length = 100, nullable = false, unique = true)
    private String orthancSeriesId;

    @Column(name = "series_instance_uid", length = 128, nullable = false, unique = true)
    private String seriesInstanceUID;

    @Column(length = 20)
    private String modality;

    @Column(length = 500)
    private String seriesDescription;

    @Column(length = 20)
    private String seriesNumber;

    @Column(nullable = false)
    @Builder.Default
    private Integer instanceCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_no", nullable = false)
    private PacsStudy study;
}