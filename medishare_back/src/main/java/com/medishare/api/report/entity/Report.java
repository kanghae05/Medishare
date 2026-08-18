package com.medishare.api.report.entity;

import com.medishare.api.member.entity.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    // pacs_study.no 외래키
    @Column(name = "study_no", nullable = false)
    private Long studyNo;

    // member.id 외래키
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_no", nullable = false)
    private Member member;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false)
    private String findings;

    @Lob
    private String impression;

    // DRAFT 또는 FINAL
    @Column(nullable = false, length = 10)
    private String status;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime writeDate;

    @LastModifiedDate
    private LocalDateTime updateDate;
}
