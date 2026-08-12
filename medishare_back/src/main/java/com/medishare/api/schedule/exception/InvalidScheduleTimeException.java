package com.medishare.api.schedule.exception;

public class InvalidScheduleTimeException extends RuntimeException {

    public InvalidScheduleTimeException() {
        super("종료 시간은 시작 시간보다 늦어야 합니다.");
    }
}
