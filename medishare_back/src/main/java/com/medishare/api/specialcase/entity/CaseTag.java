package com.medishare.api.specialcase.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 특이케이스 검색에 사용하는 태그 Entity. */
@Entity
@Table(name = "case_tags")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CaseTag {

    private static final int MAX_TAG_LENGTH = 50;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private SpecialCase specialCase;

    @Column(name = "tag_name", nullable = false, length = MAX_TAG_LENGTH)
    private String name;

    public CaseTag(SpecialCase specialCase, String name) {
        this.specialCase = specialCase;
        this.name = truncate(name);
    }

    private static String truncate(String value) {
        return value.length() > MAX_TAG_LENGTH
                ? value.substring(0, MAX_TAG_LENGTH)
                : value;
    }
}
