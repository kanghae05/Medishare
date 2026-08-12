package com.medishare.api.statistics.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ConsultationStatusResponse {

    private Long totalCount;
    private Long requestedCount;
    private Long acceptedCount;
    private Long inProgressCount;
    private Long completedCount;
    private Long canceledCount;
}
