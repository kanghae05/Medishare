package com.medishare.api.pacs.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySaveResultVO {

    // Orthanc 전체 Study 개수
    private int totalCount;

    // 신규 Study 저장 개수
    private int savedCount;

    // 기존 Study 갱신 개수
    private int updatedCount;

    // 이미 DB에 있어서 건너뛴 개수
    private int skippedCount;

    // 저장/갱신 중 실패한 개수
    private int failedCount;
}