package com.medishare.api.schedule.dto;

import com.medishare.api.schedule.entity.ScheduleType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
public class ScheduleCreateRequest {

    @NotNull
    private Long doctorId;

    @NotNull
    private LocalDate scheduleDate;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotNull
    private ScheduleType scheduleType;

    private String memo;
}
