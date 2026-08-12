package com.medishare.api.specialcase.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 특이케이스 등록/수정 요청 값을 Controller에서 전달받는 VO.
 * 판독소견서에서 받은 PACS 정보와 환자 정보도 함께 전달받는다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialCaseVO {

    private String title;

    private String modality;

    private String bodyPart;

    private String diseaseCode;

    private String findings;

    private String impression;

    private String thumbnailUrl;

    private String studyInstanceUid;

    private String seriesInstanceUid;

    // Service에서 이름 마스킹에 사용하며 원문은 DB에 저장하지 않는다.
    private String patientName;

    // Service에서 SHA-256 처리하며 원문은 DB에 저장하지 않는다.
    private String patientId;

    private List<String> tags = new ArrayList<>();
}
