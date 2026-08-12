package com.medishare.api.schedule.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "doctor_schedules")
public class DoctorSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type", nullable = false, length = 20)
    private ScheduleType scheduleType;

    @Column(length = 500)
    private String memo;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    public static DoctorSchedule create(Long doctorId, LocalDate scheduleDate, LocalTime startTime,
                                        LocalTime endTime, ScheduleType scheduleType, String memo) {
        DoctorSchedule schedule = new DoctorSchedule();
        schedule.doctorId = doctorId;
        schedule.scheduleDate = scheduleDate;
        schedule.startTime = startTime;
        schedule.endTime = endTime;
        schedule.scheduleType = scheduleType;
        schedule.memo = memo;
        schedule.isDeleted = false;
        return schedule;
    }

    public void update(LocalDate scheduleDate, LocalTime startTime, LocalTime endTime,
                       ScheduleType scheduleType, String memo) {
        this.scheduleDate = scheduleDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.scheduleType = scheduleType;
        this.memo = memo;
    }

    public void delete() {
        this.isDeleted = true;
    }

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isDeleted == null) {
            this.isDeleted = false;
        }
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
