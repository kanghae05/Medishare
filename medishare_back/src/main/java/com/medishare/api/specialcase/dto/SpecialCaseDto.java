package com.medishare.api.specialcase.dto;

import com.medishare.api.specialcase.entity.CasePacsLink;
import com.medishare.api.specialcase.entity.CaseTag;
import com.medishare.api.specialcase.entity.SpecialCase;

import java.time.LocalDateTime;
import java.util.List;

/** 특이케이스 API 요청과 응답 형식을 모아 둔 DTO 클래스. */
public final class SpecialCaseDto {

    private SpecialCaseDto() {
    }

    /** 목록 및 상세 조회에 사용하는 응답 데이터. */
    public record Response(
            Long caseId,
            Long writerId,
            String writerName,
            String title,
            String modality,
            String bodyPart,
            String diseaseCode,
            String findings,
            String impression,
            String thumbnailUrl,
            int views,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String studyInstanceUid,
            String seriesInstanceUid,
            String patientIdMasked,
            List<String> tags
    ) {
        public static Response from(SpecialCase specialCase, String writerName) {
            CasePacsLink pacsLink = specialCase.getPacsLink();

            return new Response(
                    specialCase.getId(),
                    specialCase.getWriterId(),
                    writerName,
                    specialCase.getTitle(),
                    specialCase.getModality(),
                    specialCase.getBodyPart(),
                    specialCase.getDiseaseCode(),
                    specialCase.getFindings(),
                    specialCase.getImpression(),
                    specialCase.getThumbnailUrl(),
                    specialCase.getViews(),
                    specialCase.getCreatedAt(),
                    specialCase.getUpdatedAt(),
                    pacsLink == null ? null : pacsLink.getStudyInstanceUid(),
                    pacsLink == null ? null : pacsLink.getSeriesInstanceUid(),
                    pacsLink == null ? null : pacsLink.getPatientIdMasked(),
                    specialCase.getTags().stream().map(CaseTag::getName).toList()
            );
        }
    }
}
