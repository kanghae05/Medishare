package com.medishare.api.coop.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 협진 요청 등록 폼의 "받는 의사" 자동완성 검색 결과 한 건 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorLookupVO {
    private Long no;
    private String name;
    private String departmentName; // 없을 수 있음(소속 미배정)
    private String specialty;
    private String position;
}