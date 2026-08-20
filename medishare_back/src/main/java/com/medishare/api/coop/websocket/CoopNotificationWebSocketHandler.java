package com.medishare.api.coop.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * 개인 알림 채널. 연결 주소: /ws/coop-notify
 * 방(coop_request)별이 아니라 "그 의사가 지금 우리 화면 어딘가에 접속해 있는지"만 따진다 -
 * 같은 사람이 탭을 여러 개 열어둘 수도 있어서 Set으로 관리한다.
 *
 * 새 협진요청이 오거나(CoopRequestServiceImpl.write), 채팅 메시지가 왔는데 그 방을 안 보고 있을 때
 * (CoopMessageServiceImpl.send) 여기로 알림을 쏜다.
 */
@Component
public class CoopNotificationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<Long, CopyOnWriteArraySet<WebSocketSession>> byDoctor = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long doctorId = (Long) session.getAttributes().get("doctorId");
        byDoctor.computeIfAbsent(doctorId, k -> new CopyOnWriteArraySet<>()).add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long doctorId = (Long) session.getAttributes().get("doctorId");
        CopyOnWriteArraySet<WebSocketSession> sessions = byDoctor.get(doctorId);
        if (sessions != null) {
            sessions.remove(session);
        }
    }

    /**
     * doctorId한테 알림을 쏜다. 그 사람이 지금 접속해 있는 탭이 없으면(=이 채널에 연결이 없으면)
     * 조용히 아무 일도 안 일어난다 - 이건 "지금 화면 보고 있을 때 실시간 토스트"용이지,
     * 나중에 로그인했을 때 밀린 알림을 보여주는 용도가 아니다.
     */
    public void notify(Long doctorId, String type, String title, String message, String linkUrl) {
        CopyOnWriteArraySet<WebSocketSession> sessions = byDoctor.get(doctorId);
        if (sessions == null) {
            return;
        }
        Map<String, String> payload = Map.of(
                "type", type,
                "title", title,
                "message", message,
                "linkUrl", linkUrl == null ? "" : linkUrl
        );
        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            return;
        }
        for (WebSocketSession s : sessions) {
            if (!s.isOpen()) continue;
            try {
                s.sendMessage(new TextMessage(json));
            } catch (IOException e) {
                // 세션 하나 실패해도 나머지 탭한테는 계속 보낸다
            }
        }
    }
}