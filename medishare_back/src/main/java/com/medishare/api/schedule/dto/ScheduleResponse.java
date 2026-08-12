package com.medishare.api.schedule.dto;

import com.medishare.api.schedule.entity.DoctorSchedule;
import com.medishare.api.schedule.entity.ScheduleType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
public class ScheduleResponse {

    private Long scheduleId;
    private Long doctorId;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ScheduleType scheduleType;
    private String memo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ScheduleResponse from(DoctorSchedule schedule) {
        return ScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .doctorId(schedule.getDoctorId())
                .scheduleDate(schedule.getScheduleDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .scheduleType(schedule.getScheduleType())
                .memo(schedule.getMemo())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}
