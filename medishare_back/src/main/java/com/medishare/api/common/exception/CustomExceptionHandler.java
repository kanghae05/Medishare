package com.medishare.api.common.exception;

import com.medishare.api.schedule.exception.InvalidScheduleTimeException;
import com.medishare.api.schedule.exception.ScheduleConflictException;
import com.medishare.api.schedule.exception.ScheduleNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;
import com.medishare.api.member.service.PacsAccessLogService;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Log4j2
public class CustomExceptionHandler {
    private final PacsAccessLogService pacsAccessLogService;

    public CustomExceptionHandler(PacsAccessLogService pacsAccessLogService) {
        this.pacsAccessLogService = pacsAccessLogService;
    }

    @ExceptionHandler(ScheduleNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleScheduleNotFound(ScheduleNotFoundException e) {
        return errorResponse(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(InvalidScheduleTimeException.class)
    public ResponseEntity<Map<String, String>> handleInvalidScheduleTime(InvalidScheduleTimeException e) {
        return errorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(ScheduleConflictException.class)
    public ResponseEntity<Map<String, String>> handleScheduleConflict(ScheduleConflictException e) {
        return errorResponse(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> fieldErrors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage()));

        Map<String, Object> body = new HashMap<>();
        body.put("error type", HttpStatus.BAD_REQUEST.getReasonPhrase());
        body.put("code", String.valueOf(HttpStatus.BAD_REQUEST.value()));
        body.put("message", "요청 값이 올바르지 않습니다.");
        body.put("errors", fieldErrors);

        return new ResponseEntity<>(body, new HttpHeaders(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException e, HttpServletRequest request) {
        String uri = request.getRequestURI();
        if ("/pacs/list.do".equals(uri) || "/pacs/view.do".equals(uri) || uri.startsWith("/pacs/thumbnail/")) {
            try {
                String studyId = request.getParameter("id");
                if (uri.startsWith("/pacs/thumbnail/")) studyId = uri.substring(uri.lastIndexOf('/') + 1);
                String dataType = uri.startsWith("/pacs/thumbnail/") ? "IMAGE" : "STUDY";
                pacsAccessLogService.record(SecurityContextHolder.getContext().getAuthentication(), request, dataType, "VIEW", "DENIED", studyId);
            } catch (RuntimeException logFailure) {
                log.error("Unable to save denied PACS access log.", logFailure);
            }
        }
        return errorResponse(HttpStatus.FORBIDDEN, "Access denied.");
    }

    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleException(RuntimeException e, HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

        log.error("Advice handleException called, {}, {}", request.getRequestURI(), e.getMessage());

        Map<String, String> map = new HashMap<>();
        map.put("error type", httpStatus.getReasonPhrase());
        map.put("code", String.valueOf(httpStatus.value()));
        map.put("message", e.getMessage());

        return new ResponseEntity<>(map, new HttpHeaders(), httpStatus);
    }

    private ResponseEntity<Map<String, String>> errorResponse(HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("error type", status.getReasonPhrase());
        body.put("code", String.valueOf(status.value()));
        body.put("message", message);
        return new ResponseEntity<>(body, new HttpHeaders(), status);
    }
}
