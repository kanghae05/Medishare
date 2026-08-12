package com.medishare.api.schedule.service;

import com.medishare.api.schedule.dto.ScheduleCreateRequest;
import com.medishare.api.schedule.dto.ScheduleResponse;
import com.medishare.api.schedule.dto.ScheduleUpdateRequest;
import com.medishare.api.schedule.entity.DoctorSchedule;
import com.medishare.api.schedule.exception.InvalidScheduleTimeException;
import com.medishare.api.schedule.exception.ScheduleConflictException;
import com.medishare.api.schedule.exception.ScheduleNotFoundException;
import com.medishare.api.schedule.repository.DoctorScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorScheduleService {

    private final DoctorScheduleRepository doctorScheduleRepository;

    @Transactional
    public ScheduleResponse createSchedule(ScheduleCreateRequest request) {
        validateTime(request.getStartTime(), request.getEndTime());
        validateConflict(request.getDoctorId(), request.getScheduleDate(),
                request.getStartTime(), request.getEndTime(), null);

        DoctorSchedule schedule = DoctorSchedule.create(
                request.getDoctorId(),
                request.getScheduleDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getScheduleType(),
                request.getMemo()
        );

        return ScheduleResponse.from(doctorScheduleRepository.save(schedule));
    }

    @Transactional(readOnly = true)
    public ScheduleResponse getSchedule(Long scheduleId) {
        return ScheduleResponse.from(findActiveSchedule(scheduleId));
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getDoctorSchedules(Long doctorId) {
        return doctorScheduleRepository.findByDoctorIdAndIsDeletedFalseOrderByScheduleDateAscStartTimeAsc(doctorId)
                .stream()
                .map(ScheduleResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getDoctorSchedulesByDate(Long doctorId, LocalDate date) {
        return doctorScheduleRepository
                .findByDoctorIdAndScheduleDateAndIsDeletedFalseOrderByStartTimeAsc(doctorId, date)
                .stream()
                .map(ScheduleResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getDoctorSchedulesByPeriod(Long doctorId, LocalDate startDate, LocalDate endDate) {
        return doctorScheduleRepository
                .findByDoctorIdAndScheduleDateBetweenAndIsDeletedFalseOrderByScheduleDateAscStartTimeAsc(
                        doctorId, startDate, endDate)
                .stream()
                .map(ScheduleResponse::from)
                .toList();
    }

    @Transactional
    public ScheduleResponse updateSchedule(Long scheduleId, ScheduleUpdateRequest request) {
        DoctorSchedule schedule = findActiveSchedule(scheduleId);
        validateTime(request.getStartTime(), request.getEndTime());
        validateConflict(schedule.getDoctorId(), request.getScheduleDate(),
                request.getStartTime(), request.getEndTime(), scheduleId);

        schedule.update(
                request.getScheduleDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getScheduleType(),
                request.getMemo()
        );

        return ScheduleResponse.from(schedule);
    }

    @Transactional
    public void deleteSchedule(Long scheduleId) {
        DoctorSchedule schedule = findActiveSchedule(scheduleId);
        schedule.delete();
    }

    private DoctorSchedule findActiveSchedule(Long scheduleId) {
        return doctorScheduleRepository.findByScheduleIdAndIsDeletedFalse(scheduleId)
                .orElseThrow(ScheduleNotFoundException::new);
    }

    private void validateTime(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new InvalidScheduleTimeException();
        }
    }

    private void validateConflict(Long doctorId, LocalDate scheduleDate, LocalTime startTime,
                                  LocalTime endTime, Long excludeScheduleId) {
        boolean exists = doctorScheduleRepository.existsConflictingSchedule(
                doctorId, scheduleDate, startTime, endTime, excludeScheduleId);
        if (exists) {
            throw new ScheduleConflictException();
        }
    }
}
