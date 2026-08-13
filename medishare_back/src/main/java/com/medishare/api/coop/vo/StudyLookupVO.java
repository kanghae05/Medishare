package com.medishare.api.coop.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 선택한 환자의 검사 목록 드롭다운 항목 한 건 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyLookupVO {
    private Long no;
    private String studyDescription;
    private String studyDate; // "yyyyMMdd" 원본 그대로, 프론트에서 표시용으로 가공
}