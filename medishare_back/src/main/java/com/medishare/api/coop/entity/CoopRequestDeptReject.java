package com.medishare.api.coop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/*
    진료과 단위 협진요청에 대한 의사 개인별 거절 기록 (coop_request_dept_reject)
    - coop_request.status는 건드리지 않고, 이 테이블에만 개인별로 쌓인다.
    - (coop_request_id, doctor_id) UNIQUE로 중복 거절을 막는다.
*/
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "coop_request_dept_reject",
        uniqueConstraints = @UniqueConstraint(columnNames = {"coop_request_id", "doctor_id"})
)
public class CoopRequestDeptReject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long coopRequestId;

    @Column(nullable = false)
    private Long doctorId;

    @Column(length = 1000, nullable = false)
    private String rejectReason;

    @Column(updatable = false)
    private LocalDateTime rejectedAt;

    @PrePersist
    void prePersist() {
        if (this.rejectedAt == null) {
            this.rejectedAt = LocalDateTime.now();
        }
    }
}