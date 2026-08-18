package com.medishare.api.coop.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 협진 요청 등록 폼의 "환자" 자동완성 검색 결과 한 건 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientLookupVO {
    private Long no;
    private String patientName;
    private String patientSex;
    private String patientBirthDate;
}
