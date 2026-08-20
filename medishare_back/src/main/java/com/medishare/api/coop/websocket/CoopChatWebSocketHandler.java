package com.medishare.api.coop.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medishare.api.coop.service.CoopMessageService;
import com.medishare.api.coop.vo.CoopMessageVO;
import org.springframework.context.annotation.Lazy;
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
 */
@Component
public class CoopChatWebSocketHandler extends TextWebSocketHandler {

    private final CoopMessageService coopMessageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // coopRequestId 별로 접속 중인 세션들을 모아둔다 (채팅방 개념)
    private final Map<Long, CopyOnWriteArraySet<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    /**
     * CoopMessageServiceImpl이 읽음 이벤트를 브로드캐스트하려고 이 핸들러를 참조하는데,
     * 이 핸들러도 CoopMessageService를 참조하고 있어서 그대로 두면 순환참조로 기동이 안 된다.
     * 이쪽(WebSocket 핸들러)을 @Lazy로 지연 주입해서 순환을 끊는다.
     */
    public CoopChatWebSocketHandler(@Lazy CoopMessageService coopMessageService) {
        this.coopMessageService = coopMessageService;
    }

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
            copy.setRead(saved.isRead());
            s.sendMessage(new TextMessage(objectMapper.writeValueAsString(copy)));
        }
    }

    /**
     * readerId가 이 채팅방을 방금 열람해서 상대방(readerId가 아닌 쪽)이 보낸 메시지를 읽음 처리했다는 걸,
     * 그 상대방(발신자)한테 실시간으로 알려준다. readerId 본인 세션한테는 안 보낸다 -
     * "내가 상대방 메시지를 읽었다"는 알림이 본인 화면엔 의미가 없어서 (본인이 보낸 메시지 읽음 표시가
     * 잘못 갱신되는 걸 막기 위한 필터이기도 하다).
     */
    public void broadcastReadEvent(Long coopRequestId, Long readerId) {
        CopyOnWriteArraySet<WebSocketSession> room = rooms.get(coopRequestId);
        if (room == null) {
            return;
        }
        for (WebSocketSession s : room) {
            if (!s.isOpen()) continue;
            Long viewerId = (Long) s.getAttributes().get("doctorId");
            if (readerId.equals(viewerId)) continue; // 읽은 사람 본인은 스킵
            try {
                s.sendMessage(new TextMessage(objectMapper.writeValueAsString(Map.of("type", "read"))));
            } catch (IOException e) {
                // 세션 하나 실패해도 나머지 세션한테는 계속 보낸다
            }
        }
    }
}