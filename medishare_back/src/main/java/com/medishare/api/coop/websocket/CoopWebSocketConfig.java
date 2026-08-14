package com.medishare.api.coop.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class CoopWebSocketConfig implements WebSocketConfigurer {

    private final CoopChatWebSocketHandler coopChatWebSocketHandler;
    private final CoopChatHandshakeInterceptor coopChatHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(coopChatWebSocketHandler, "/ws/coop/{coopRequestId}")
                .addInterceptors(coopChatHandshakeInterceptor)
                // TODO: 실제 배포 시엔 프론트 도메인만 명시하는 게 안전하다. 지금은 개발 편의상 전체 허용.
                .setAllowedOriginPatterns("*");
    }
}