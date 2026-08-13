package com.medishare.api.coop.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 협진 요청 등록 폼의 "받는 진료과" 드롭다운 항목 한 건 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentLookupVO {
    private Long no;
    private String departmentName;
}