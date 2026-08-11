package com.medishare.api.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/*
    협진요청 (coop_request)
    status 값 (MariaDB ENUM과 1:1): 요청, 수락, 거절, 취소, 만료
    recv_type 값: 지정의사, 진료과

    주의:
    - doctor / patient / pacs_study / report / department 는 타 담당자 소관 테이블이라
      현재는 FK 컬럼값(Long id)만 갖고 연관관계는 걸지 않는다.
    - accept/reject/cancel/deptReject 확정 같은 "동시에 여러 명이 건드릴 수 있는" 상태 변경은 반드시
      CoopRequestRepository의 조건부 UPDATE(@Modifying, WHERE status='요청')로 처리하고,
      이 엔티티의 setter로 직접 상태를 바꾸지 않는다. (진료과 요청은 여러 의사가 동시에 수락/거절을 시도할 수 있어
      단순 findById → setter → save() 로는 레이스 컨디션을 못 막음)
 */
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "coop_request")
public class CoopRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long coopRequestId;

    @Column(nullable = false)
    private Long reqDoctorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecvType recvType;

    private Long recvDoctorId;

    private Long recvDeptId;

    private Long acceptDoctorId;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private Long pacsStudyId;

    private Long reportId;

    // 재요청(이메일 답장 패턴) - 이전 요청의 coop_request_id
    private Long originRequestId;

    @Column(length = 2000, nullable = false)
    private String reqContent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CoopStatus status = CoopStatus.요청;

    @Column(updatable = false)
    private LocalDateTime reqTime;

    private LocalDateTime respTime;

    @Column(length = 1000)
    private String rejectReason;

    @Builder.Default
    @Column(nullable = false)
    private boolean isRead = false;

    private LocalDateTime readTime;

    @PrePersist
    void prePersist() {
        if (this.reqTime == null) {
            this.reqTime = LocalDateTime.now();
        }
    }
}