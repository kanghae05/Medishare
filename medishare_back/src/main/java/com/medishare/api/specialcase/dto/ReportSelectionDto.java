package com.medishare.api.specialcase.dto;

import java.time.LocalDateTime;

/** 특이케이스 등록 화면에서 선택할 판독소견서와 PACS 메타데이터. */
public record ReportSelectionDto(
        Long reportId,
        Long studyNo,
        String title,
        String findings,
        String impression,
        String status,
        String writerName,
        LocalDateTime writtenAt,
        String studyInstanceUid,
        String seriesInstanceUid,
        String modality,
        String bodyPart,
        String patientName,
        String patientId
) {
}
