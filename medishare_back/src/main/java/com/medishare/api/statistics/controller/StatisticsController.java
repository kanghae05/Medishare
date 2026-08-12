package com.medishare.api.statistics.controller;

import com.medishare.api.statistics.dto.ConsultationStatusResponse;
import com.medishare.api.statistics.dto.DiseaseStatisticsResponse;
import com.medishare.api.statistics.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/consultations")
    public ResponseEntity<ConsultationStatusResponse> getConsultationStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getConsultationStatistics(null, startDate, endDate));
    }

    @GetMapping("/consultations/doctor/{doctorId}")
    public ResponseEntity<ConsultationStatusResponse> getDoctorConsultationStatistics(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getConsultationStatistics(doctorId, startDate, endDate));
    }

    @GetMapping("/diseases")
    public ResponseEntity<List<DiseaseStatisticsResponse>> getDiseaseStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(statisticsService.getDiseaseStatistics(startDate, endDate));
    }

    @GetMapping("/diseases/top")
    public ResponseEntity<List<DiseaseStatisticsResponse>> getTopDiseaseStatistics(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(statisticsService.getTopDiseaseStatistics(limit));
    }
}
