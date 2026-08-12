package com.medishare.api.specialcase.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/** 특이케이스와 PACS Study를 연결하는 식별 정보를 저장한다. */
@Entity
@Table(name = "case_pacs_links")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CasePacsLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pacs_link_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false, unique = true)
    private SpecialCase specialCase;

    @Column(name = "study_instance_uid", nullable = false, length = 128)
    private String studyInstanceUid;

    @Column(name = "series_instance_uid", length = 128)
    private String seriesInstanceUid;

    // 원본 환자 ID는 저장하지 않고 SHA-256 처리 결과만 저장한다.
    @Column(name = "patient_id_masked", length = 64)
    private String patientIdMasked;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public CasePacsLink(
            SpecialCase specialCase,
            String studyInstanceUid,
            String seriesInstanceUid,
            String patientIdMasked
    ) {
        this.specialCase = specialCase;
        this.studyInstanceUid = studyInstanceUid;
        this.seriesInstanceUid = seriesInstanceUid;
        this.patientIdMasked = patientIdMasked;
    }
}
