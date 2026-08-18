package com.medishare.api.coop.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medishare.api.coop.service.CoopMessageService;
import com.medishare.api.coop.vo.CoopMessageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * 협진요청 건별 실시간 채팅 WebSocket 핸들러.
 * 연결 주소: /ws/coop/{coopRequestId}
 *
 * 세션 attributes에 "doctorId"(Long)는 CoopChatHandshakeInterceptor가
 * (JwtTokenProvider로 토큰 검증 후) 미리 채워놓은 값을 그대로 사용한다.
 * "coopRequestId"(Long)도 같은 인터셉터가 URL에서 뽑아 채워놓는다.
 *
 * TODO: CoopChatHandshakeInterceptor가 JwtTokenProvider 코드를 받는 대로 완성되어야
 * 이 핸들러가 실제로 안전하게 동작한다. (인증 안 된 연결을 여기서 막는 게 아니라
 * 애초에 핸드셰이크 단계에서 거부하는 구조)
 */
@Component
@RequiredArgsConstructor
public class CoopChatWebSocketHandler extends TextWebSocketHandler {

    private final CoopMessageService coopMessageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // coopRequestId 별로 접속 중인 세션들을 모아둔다 (채팅방 개념)
    private final Map<Long, CopyOnWriteArraySet<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long coopRequestId = (Long) session.getAttributes().get("coopRequestId");
        rooms.computeIfAbsent(coopRequestId, k -> new CopyOnWriteArraySet<>()).add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long coopRequestId = (Long) session.getAttributes().get("coopRequestId");
        CopyOnWriteArraySet<WebSocketSession> room = rooms.get(coopRequestId);
        if (room != null) {
            room.remove(session);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long coopRequestId = (Long) session.getAttributes().get("coopRequestId");
        Long senderId = (Long) session.getAttributes().get("doctorId");

        // 프론트에서 { "content": "..." } 형태로 보낸다.
        Map<String, String> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String content = payload.get("content");

        CoopMessageVO saved = coopMessageService.send(coopRequestId, senderId, content);
        broadcast(coopRequestId, saved);
    }

    /** 저장된 메시지를 그 방(coopRequestId)에 접속한 모든 세션에게 전송한다. 세션마다 mine을 다시 계산해서 보낸다. */
    private void broadcast(Long coopRequestId, CoopMessageVO saved) throws IOException {
        CopyOnWriteArraySet<WebSocketSession> room = rooms.get(coopRequestId);
        if (room == null) {
            return;
        }
        for (WebSocketSession s : room) {
            if (!s.isOpen()) continue;
            Long viewerId = (Long) s.getAttributes().get("doctorId");
            CoopMessageVO copy = new CoopMessageVO();
            copy.setCoopMessageId(saved.getCoopMessageId());
            copy.setCoopRequestId(saved.getCoopRequestId());
            copy.setSenderDoctorId(saved.getSenderDoctorId());
            copy.setSenderName(saved.getSenderName());
            copy.setContent(saved.getContent());
            copy.setSentAt(saved.getSentAt());
            copy.setMine(saved.getSenderDoctorId().equals(viewerId));
            s.sendMessage(new TextMessage(objectMapper.writeValueAsString(copy)));
        }
    }
}
