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
    private String studyTime; // "HHmmss" 원본 그대로, 프론트에서 표시용으로 가공
    private Integer instanceCount; // 설명/날짜가 비어있는 실데이터가 많아 구분용으로 같이 보여준다
    private String requestedProcedureDescription; // 검사 요청 사유 - 선택 후 아래에 보조 정보로 표시
}