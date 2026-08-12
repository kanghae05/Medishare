package com.medishare.api.schedule.exception;

public class ScheduleConflictException extends RuntimeException {

    public ScheduleConflictException() {
        super("해당 시간에는 이미 등록된 일정이 있습니다.");
    }
}
