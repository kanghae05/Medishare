package com.medishare.api.schedule.controller;

import com.medishare.api.schedule.dto.ScheduleCreateRequest;
import com.medishare.api.schedule.dto.ScheduleResponse;
import com.medishare.api.schedule.dto.ScheduleUpdateRequest;
import com.medishare.api.schedule.service.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;

    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(@Valid @RequestBody ScheduleCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(doctorScheduleService.createSchedule(request));
    }

    @GetMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponse> getSchedule(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(doctorScheduleService.getSchedule(scheduleId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ScheduleResponse>> getDoctorSchedules(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (date != null) {
            return ResponseEntity.ok(doctorScheduleService.getDoctorSchedulesByDate(doctorId, date));
        }

        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(doctorScheduleService.getDoctorSchedulesByPeriod(doctorId, startDate, endDate));
        }

        return ResponseEntity.ok(doctorScheduleService.getDoctorSchedules(doctorId));
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponse> updateSchedule(@PathVariable Long scheduleId,
                                                           @Valid @RequestBody ScheduleUpdateRequest request) {
        return ResponseEntity.ok(doctorScheduleService.updateSchedule(scheduleId, request));
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long scheduleId) {
        doctorScheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.noContent().build();
    }
}
