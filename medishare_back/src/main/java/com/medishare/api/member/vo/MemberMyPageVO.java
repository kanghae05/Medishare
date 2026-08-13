package com.medishare.api.member.vo;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberMyPageVO {
    private final Long memberNo;
    private final String loginId;
    private final String name;
    private final String email;
    private final String tel;
    private final Long departmentNo;
    private final String departmentName;
    private final String position;
    private final String specialty;
    private final String status;
}
