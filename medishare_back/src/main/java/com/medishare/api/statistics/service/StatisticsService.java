package com.medishare.api.statistics.service;

import com.medishare.api.coop.entity.CoopStatus;
import com.medishare.api.coop.repository.CoopRequestRepository;
import com.medishare.api.statistics.dto.ConsultationStatusResponse;
import com.medishare.api.statistics.dto.DiseaseStatisticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final CoopRequestRepository coopRequestRepository;

    @Transactional(readOnly = true)
    public ConsultationStatusResponse getConsultationStatistics(Long doctorId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate == null ? null : startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate == null ? null : endDate.plusDays(1).atStartOfDay();

        CoopStatus[] statuses = CoopStatus.values();
        long requested = countByStatus(statuses, 0, doctorId, startDateTime, endDateTime);
        long accepted = countByStatus(statuses, 1, doctorId, startDateTime, endDateTime);
        long canceled = countByStatus(statuses, 3, doctorId, startDateTime, endDateTime);
        long completed = countByStatus(statuses, 4, doctorId, startDateTime, endDateTime);
        long total = coopRequestRepository.countConsultations(doctorId, startDateTime, endDateTime);

        return ConsultationStatusResponse.builder()
                .totalCount(total)
                .requestedCount(requested)
                .acceptedCount(accepted)
                .inProgressCount(0L)
                .completedCount(completed)
                .canceledCount(canceled)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DiseaseStatisticsResponse> getDiseaseStatistics(LocalDate startDate, LocalDate endDate) {
        // TODO: Disease/InterpretationReport entity integration is pending in another part.
        return List.of();
    }

    @Transactional(readOnly = true)
    public List<DiseaseStatisticsResponse> getTopDiseaseStatistics(int limit) {
        // TODO: Disease/InterpretationReport entity integration is pending in another part.
        return List.of();
    }

    private long countByStatus(CoopStatus[] statuses, int index, Long doctorId,
                               LocalDateTime startDateTime, LocalDateTime endDateTime) {
        if (statuses.length <= index) {
            return 0L;
        }
        return coopRequestRepository.countConsultationsByStatus(
                statuses[index], doctorId, startDateTime, endDateTime);
    }
}
