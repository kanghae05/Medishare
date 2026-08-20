package com.medishare.api.coop.websocket;

import com.medishare.api.config.security.JwtTokenProvider;
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
 * 개인 알림 채널(/ws/coop-notify) 핸드셰이크 인증.
 * 채팅과 달리 특정 방(coopRequestId) 개념이 없다 - 그냥 "이 사람이 로그인된 게 맞는지"만 확인하고,
 * 세션에 doctorId를 저장해둔다. 알림은 이후 CoopNotificationWebSocketHandler가 doctorId 기준으로 쏜다.
 */
@Component
@RequiredArgsConstructor
public class CoopNotifyHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        URI uri = request.getURI();

        String token = UriComponentsBuilder.fromUri(uri).build()
                .getQueryParams().getFirst("token");
        if (token == null || token.isBlank() || !jwtTokenProvider.validateToken(token)) {
            return false;
        }

        Authentication authentication = jwtTokenProvider.getAuthentication(token);
        Member member = (Member) authentication.getPrincipal();
        attributes.put("doctorId", member.getNo());
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // 별도 처리 없음
    }
}