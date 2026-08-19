package com.medishare.api.coop.websocket;

import com.medishare.api.config.security.JwtTokenProvider;
import com.medishare.api.coop.service.CoopMessageService;
import com.medishare.api.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

/**
 * WebSocket 연결(핸드셰이크) 시점에 딱 세 가지를 한다.
 * 1. URL에서 coopRequestId를 뽑아 세션에 저장
 * 2. 쿼리 파라미터로 넘어온 JWT를 검증해서 그 사람의 doctorId/deptId를 세션에 저장
 *    (WebSocket은 브라우저에서 커스텀 헤더(X-AUTH-TOKEN)를 못 실어 보내서,
 *     쿼리 파라미터 ?token=... 으로 받는 방식을 대신 쓴다 - JwtTokenProvider 자체는
 *     HTTP 필터에서 쓰던 것과 완전히 동일한 걸 그대로 재사용한다)
 * 3. 그 사람이 이 협진요청의 당사자가 아니면 연결 자체를 거부한다 (beforeHandshake에서 false 반환)
 */
@Component
@RequiredArgsConstructor
public class CoopChatHandshakeInterceptor implements HandshakeInterceptor {

    private final CoopMessageService coopMessageService;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                    WebSocketHandler wsHandler, Map<String, Object> attributes) {
        URI uri = request.getURI();

        // 1) URL 경로에서 coopRequestId 추출 (/ws/coop/123 형태)
        String path = uri.getPath();
        String[] segments = path.split("/");
        Long coopRequestId;
        try {
            coopRequestId = Long.parseLong(segments[segments.length - 1]);
        } catch (NumberFormatException e) {
            return false; // 잘못된 URL
        }

        // 2) 쿼리 파라미터에서 토큰 추출 및 검증 (JwtTokenProvider, HTTP 필터와 동일한 것 재사용)
        String token = UriComponentsBuilder.fromUri(uri).build()
                .getQueryParams().getFirst("token");
        if (token == null || token.isBlank() || !jwtTokenProvider.validateToken(token)) {
            return false; // 토큰 없음 또는 위조/만료 - 연결 거부
        }

        Authentication authentication = jwtTokenProvider.getAuthentication(token);
        Member member = (Member) authentication.getPrincipal();
        Long doctorId = member.getNo();
        Long deptId = member.getDepartment() != null ? member.getDepartment().getNo() : null;

        // 3) 이 협진요청의 당사자인지 확인
        if (!coopMessageService.isParticipant(coopRequestId, doctorId, deptId)) {
            return false;
        }

        attributes.put("coopRequestId", coopRequestId);
        attributes.put("doctorId", doctorId);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception exception) {
        // 별도 처리 없음
    }
}
