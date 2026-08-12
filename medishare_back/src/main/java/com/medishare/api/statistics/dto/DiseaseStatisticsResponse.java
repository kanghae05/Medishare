package com.medishare.api.statistics.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiseaseStatisticsResponse {

    private Long diseaseId;
    private String diseaseCode;
    private String diseaseName;
    private Long interpretationCount;
    private Long consultationCount;
    private Long completedConsultationCount;
    private Double ratio;
}
