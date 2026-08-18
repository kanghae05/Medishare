package com.medishare.api.coop.vo;

import lombok.Data;

// 진료과 요청 개인별 거절 기록 - 요청자가 "누가 왜 거절했는지" 확인할 때 사용
@Data
public class CoopRequestDeptRejectVO {
    private Long doctorId;
    private String doctorName;
    private String rejectReason;
    private String rejectedAt;
}
