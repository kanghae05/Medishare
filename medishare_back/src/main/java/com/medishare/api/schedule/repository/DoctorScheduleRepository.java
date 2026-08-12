package com.medishare.api.schedule.repository;

import com.medishare.api.schedule.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {

    Optional<DoctorSchedule> findByScheduleIdAndIsDeletedFalse(Long scheduleId);

    List<DoctorSchedule> findByDoctorIdAndIsDeletedFalseOrderByScheduleDateAscStartTimeAsc(Long doctorId);

    List<DoctorSchedule> findByDoctorIdAndScheduleDateAndIsDeletedFalseOrderByStartTimeAsc(Long doctorId,
                                                                                           LocalDate scheduleDate);

    List<DoctorSchedule> findByDoctorIdAndScheduleDateBetweenAndIsDeletedFalseOrderByScheduleDateAscStartTimeAsc(
            Long doctorId, LocalDate startDate, LocalDate endDate);

    @Query("""
            SELECT COUNT(s) > 0
            FROM DoctorSchedule s
            WHERE s.doctorId = :doctorId
              AND s.scheduleDate = :scheduleDate
              AND s.isDeleted = false
              AND (:excludeScheduleId IS NULL OR s.scheduleId <> :excludeScheduleId)
              AND s.startTime < :endTime
              AND s.endTime > :startTime
            """)
    boolean existsConflictingSchedule(@Param("doctorId") Long doctorId,
                                      @Param("scheduleDate") LocalDate scheduleDate,
                                      @Param("startTime") LocalTime startTime,
                                      @Param("endTime") LocalTime endTime,
                                      @Param("excludeScheduleId") Long excludeScheduleId);
}
