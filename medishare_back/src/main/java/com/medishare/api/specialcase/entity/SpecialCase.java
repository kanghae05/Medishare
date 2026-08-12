package com.medishare.api.specialcase.entity;

import com.medishare.api.specialcase.vo.SpecialCaseVO;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

/** 특이케이스 본문과 검색 분류 정보를 저장하는 Entity. */
@Entity
@Table(name = "special_cases")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SpecialCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_id")
    private Long id;

    // 회원 모듈과 Entity 연관관계를 만들지 않고 회원 PK만 보관한다.
    @Column(name = "writer_id", nullable = false)
    private Long writerId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 20)
    private String modality;

    @Column(name = "body_part", nullable = false, length = 50)
    private String bodyPart;

    @Column(name = "disease_code", length = 20)
    private String diseaseCode;

    // JPQL lower() 검색을 위해 @Lob 대신 TEXT 컬럼의 일반 String으로 매핑한다.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String findings;

    @Lob
    @Column(nullable = false)
    private String impression;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(nullable = false)
    private int views;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 실제 DELETE 대신 이 값을 true로 바꾸는 Soft Delete 방식을 사용한다.
    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @OneToOne(
            mappedBy = "specialCase",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private CasePacsLink pacsLink;

    @OneToMany(
            mappedBy = "specialCase",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private final List<CaseTag> tags = new ArrayList<>();

    public SpecialCase(
            Long writerId,
            SpecialCaseVO vo,
            String safeFindings,
            String safeImpression
    ) {
        this.writerId = writerId;
        update(vo, safeFindings, safeImpression);
    }

    /** 비식별화가 완료된 소견과 결론으로 수정한다. */
    public void update(
            SpecialCaseVO vo,
            String safeFindings,
            String safeImpression
    ) {
        this.title = requireText(vo.getTitle(), "title");
        this.modality = requireText(vo.getModality(), "modality");
        this.bodyPart = requireText(vo.getBodyPart(), "bodyPart");
        this.diseaseCode = emptyToNull(vo.getDiseaseCode());
        this.findings = requireText(safeFindings, "findings");
        this.impression = requireText(safeImpression, "impression");
        this.thumbnailUrl = emptyToNull(vo.getThumbnailUrl());
    }

    public void replacePacsLink(CasePacsLink pacsLink) {
        this.pacsLink = pacsLink;
    }

    /** 기존 태그를 제거하고 중복 없는 새 태그를 최대 20개까지 등록한다. */
    public void replaceTags(Collection<String> tagNames) {
        tags.clear();

        tagNames.stream()
                .map(SpecialCase::emptyToNull)
                .filter(Objects::nonNull)
                .distinct()
                .limit(20)
                .forEach(tagName -> tags.add(new CaseTag(this, tagName)));
    }

    public void increaseViews() {
        views++;
    }

    public void delete() {
        deleted = true;
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }

        return value.trim();
    }

    private static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
