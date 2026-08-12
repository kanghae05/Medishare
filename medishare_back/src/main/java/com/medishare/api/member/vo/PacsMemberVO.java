package com.medishare.api.member.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PacsMemberVO {
    private Long no;
    private String loginId;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String memberName;
    private String email;
    private String phone;
    private Long departmentNo;
    private String departmentName;
    private String position;
    private String specialty;
    private String status;
    private Boolean stable;
}
