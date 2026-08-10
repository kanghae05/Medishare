package com.medishare.api.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

// 자동 생성되는 어노테이션
@RestControllerAdvice
@Log4j2
public class CustomExceptionHandler {

    // 예외가 발생되면 처리(어노테니션으로 지정)되는 메서드 작성
    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<Map<String, String>>
    handleException(RuntimeException e, HttpServletRequest request){

        // 전달되는 데이터(서버->클라이언트)의 정보가 저장
        HttpHeaders resposeHeaders = new HttpHeaders(); // header + body
//        HttpStatus httpStatus = HttpStatus.BAD_REQUEST; // 400 번 오류
        HttpStatus httpStatus =  HttpStatus.INTERNAL_SERVER_ERROR; // 500 번 오류

        log.error("Advice 내 handleException 호출, {}, {}", request.getRequestURI(),
                e.getMessage());
        log.info(resposeHeaders.toString());

        // 예외가 발생되면 전달되는 정보를 Map
        Map<String , String > map = new HashMap<>();
        map.put("error type", httpStatus.getReasonPhrase());
        map.put("code", httpStatus.value() + "");
        map.put("message", e.getMessage());

        return new ResponseEntity<>(map, resposeHeaders, httpStatus);
    }

}
