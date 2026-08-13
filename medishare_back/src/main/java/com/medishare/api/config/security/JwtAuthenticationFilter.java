package com.medishare.api.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Log4j2
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    // JwtTokenProvider를 세팅하는 생성자
    // @Autowide 를 붙이지 않아도 spring 4.xx 부터 자동으로 DI 적용된다.
    // 현재 spring 버전을 6.2.xx 버전이다.
    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider){
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal
            (HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // 여기에 작성하면 전처리 필터
        // 토큰 처리
        // request 안에 header에 있는 토큰 가져오기
        String token = jwtTokenProvider.resolveToken(request);
        log.info("[doFilterInternal] Authentication token header processed. present={}", token != null);

        log.info("[doFilterInternal] token 값 유효성 체크 시작");
        if(token != null && jwtTokenProvider.validateToken(token)){
            Authentication authentication = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("[doFilterInternal] token 값 유효성 체크 성공");
        }
        log.info("[doFilterInternal] token 값 유효성 체크 완료");


        filterChain.doFilter(request, response); // 다음 필터나 요구 자원 처리를 진행시킨다.
        // 여기에 작성하면 후처리 필터
    }
}
