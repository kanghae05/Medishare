package com.medishare.api.member.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberUpdateVO {
    private String name;
    private String email;
    private String tel;
    private Long departmentNo;
    private String position;
    private String specialty;
}
