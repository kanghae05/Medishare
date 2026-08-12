package com.medishare.api.member.vo;

import lombok.Data;

@Data
public class PacsDepartmentVO {
    private Long no;
    private String departmentName;
    private String description;
    private String status;
    private Boolean stable;
}
