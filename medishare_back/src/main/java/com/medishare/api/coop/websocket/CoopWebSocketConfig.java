package com.medishare.api.coop.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

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

    /**
     * 기본 WebSocket 텍스트 메시지 버퍼가 작아서(보통 8KB 안팎), 영상에 그림을 그려서
     * base64로 보내는 이미지 메시지가 걸릴 수 있다. 넉넉하게(5MB) 늘려둔다.
     */
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(5 * 1024 * 1024);
        container.setMaxBinaryMessageBufferSize(5 * 1024 * 1024);
        return container;
    }
}