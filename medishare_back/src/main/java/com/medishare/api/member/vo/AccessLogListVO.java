package com.medishare.api.member.vo;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AccessLogListVO {
    private final Long logNo;
    private final Long memberNo;
    private final String loginId;
    private final String memberName;
    private final String departmentName;
    private final Long patientNo;
    private final String patientId;
    private final Long studyNo;
    private final String studyInstanceUid;
    private final String dataType;
    private final String actionType;
    private final String accessResult;
    private final String ipAddress;
    private final LocalDateTime accessedAt;
}
