package com.medishare.api.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medishare.api.data.dto.EntryPointErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Log4j2
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper(); // Java 객체 → JSON (직렬화, Serialization) 객체
        log.info("[commence] 인증 실패로 response.sendError 발생");

        // response로 보내질 에러 메시지 세팅
        EntryPointErrorResponse entryPointErrorResponse = new EntryPointErrorResponse();
        entryPointErrorResponse.setMsg("인증이 실패하였습니다.");

        // response 대한 세팅
        response.setStatus(HttpStatus.UNAUTHORIZED.value()); // 401
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
        // objectMapper 를 이용해서 객체를 JSON으로 만들어서 출력하면 서버에서 클라이언트 쪽으로 데이터를 보낸다.
        response.getWriter().write(objectMapper.writeValueAsString(entryPointErrorResponse));

    }

}
