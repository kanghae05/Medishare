package com.medishare.api.schedule.exception;

public class ScheduleNotFoundException extends RuntimeException {

    public ScheduleNotFoundException() {
        super("존재하지 않는 일정입니다.");
    }
}
