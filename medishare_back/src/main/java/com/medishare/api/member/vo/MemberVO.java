package com.medishare.api.member.vo;

import lombok.Data;

@Data
public class MemberVO {
    private String id;
    private String pw;
    private String name;
    private String email;
    private String tel;
    private Long departmentNo;
    private String position;
}
