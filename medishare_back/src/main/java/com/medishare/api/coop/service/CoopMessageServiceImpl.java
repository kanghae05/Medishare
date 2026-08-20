package com.medishare.api.coop.service;

import com.medishare.api.coop.entity.CoopMessage;
import com.medishare.api.coop.entity.CoopRequest;
import com.medishare.api.coop.entity.CoopStatus;
import com.medishare.api.coop.repository.CoopMemberLookupRepository;
import com.medishare.api.coop.repository.CoopMessageRepository;
import com.medishare.api.coop.repository.CoopRequestRepository;
import com.medishare.api.coop.vo.ChatRoomVO;
import com.medishare.api.coop.vo.CoopMessageVO;
import com.medishare.api.coop.websocket.CoopChatWebSocketHandler;
import com.medishare.api.coop.websocket.CoopNotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoopMessageServiceImpl implements CoopMessageService {

    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final CoopMessageRepository coopMessageRepository;
    private final CoopRequestRepository coopRequestRepository;
    private final CoopMemberLookupRepository memberRepository;
    private final CoopChatWebSocketHandler webSocketHandler;
    private final CoopNotificationWebSocketHandler notificationHandler;

    @Override
    @Transactional
    public List<CoopMessageVO> history(Long coopRequestId, Long viewerId) {
        markAsReadByViewer(coopRequestId, viewerId);
        return coopMessageRepository.findByCoopRequestIdOrderBySentAtAsc(coopRequestId).stream()
                .map(m -> toVO(m, viewerId))
                .toList();
    }

    @Override
    @Transactional
    public void markAsReadByViewer(Long coopRequestId, Long viewerId) {
        int updated = coopMessageRepository.markAsRead(coopRequestId, viewerId);
        if (updated > 0) {
            // 실제로 새로 읽음 처리된 게 있을 때만 상대방한테 실시간으로 알려준다.
            webSocketHandler.broadcastReadEvent(coopRequestId, viewerId);
        }
    }

    @Override
    @Transactional
    public CoopMessageVO send(Long coopRequestId, Long senderId, String content, String messageType) {
        if (content == null || content.isBlank()) {
            throw new RuntimeException("메시지 내용을 입력해주세요.");
        }
        String type = (messageType == null || messageType.isBlank()) ? "TEXT" : messageType;
        CoopMessage saved = coopMessageRepository.save(
                CoopMessage.builder()
                        .coopRequestId(coopRequestId)
                        .senderDoctorId(senderId)
                        .content("IMAGE".equals(type) ? content : content.trim())
                        .messageType(type)
                        .build()
        );
        CoopMessageVO vo = toVO(saved, senderId);
        // 저장 즉시 그 방에 접속 중인 모든 세션한테 실시간으로 전파한다 (호출 경로 무관하게 여기서 한 번에 처리).
        webSocketHandler.broadcast(coopRequestId, vo);

        // 상대방이 지금 이 방을 안 보고 있으면(=이미 화면에 실시간으로 뜨는 게 아니면) 토스트 알림도 쏜다.
        coopRequestRepository.findById(coopRequestId).ifPresent(c -> {
            Long recipientId = c.getReqDoctorId().equals(senderId) ? c.getAcceptDoctorId() : c.getReqDoctorId();
            if (recipientId != null && !webSocketHandler.hasOpenSession(coopRequestId, recipientId)) {
                String preview = "IMAGE".equals(type) ? "그림을 보냈습니다." : content.trim();
                if (preview.length() > 40) {
                    preview = preview.substring(0, 40) + "...";
                }
                notificationHandler.notify(recipientId, "chat_message",
                        vo.getSenderName() == null ? "새 메시지" : vo.getSenderName(),
                        preview, "/coop/chat?no=" + coopRequestId);
            }
        });

        return vo;
    }

    @Override
    public boolean isParticipant(Long coopRequestId, Long doctorId, Long deptId) {
        CoopRequest c = coopRequestRepository.findById(coopRequestId).orElse(null);
        if (c == null) {
            return false;
        }
        // 수락되기 전(요청/거절/취소/만료)에는 채팅 자체를 열 수 없다.
        // 진료과 요청은 수락 전에 소속과 누구나 볼 수 있었지만, 채팅은 실제로
        // "이 건을 맡기로 한 사람"과 요청자 둘만 - 그래서 acceptDoctorId 기준으로만 판단한다.
        if (c.getStatus() != CoopStatus.수락) {
            return false;
        }
        return doctorId.equals(c.getReqDoctorId()) || doctorId.equals(c.getAcceptDoctorId());
    }

    @Override
    public List<ChatRoomVO> myChatRooms(Long doctorId) {
        List<CoopRequest> rooms = coopRequestRepository.findMyChatRooms(doctorId);
        List<ChatRoomVO> result = new java.util.ArrayList<>();

        for (CoopRequest c : rooms) {
            ChatRoomVO vo = new ChatRoomVO();
            vo.setCoopRequestId(c.getCoopRequestId());
            vo.setReqDate(c.getReqTime() == null ? null : c.getReqTime().toLocalDate().toString());

            // 상대방 = 나 아닌 쪽 (요청자 또는 수락자)
            Long counterpartId = c.getReqDoctorId().equals(doctorId) ? c.getAcceptDoctorId() : c.getReqDoctorId();
            memberRepository.findById(counterpartId).ifPresent(m -> {
                vo.setCounterpartName(m.getName());
                List<String> metaParts = new java.util.ArrayList<>();
                if (m.getDepartment() != null && m.getDepartment().getDepartmentName() != null) {
                    metaParts.add(m.getDepartment().getDepartmentName());
                }
                if (m.getSpecialty() != null && !m.getSpecialty().isBlank()) {
                    metaParts.add(m.getSpecialty());
                }
                if (m.getPosition() != null && !m.getPosition().isBlank()) {
                    metaParts.add(m.getPosition());
                }
                vo.setCounterpartMeta(String.join(" · ", metaParts));
            });

            coopMessageRepository.findFirstByCoopRequestIdOrderBySentAtDesc(c.getCoopRequestId())
                    .ifPresent(last -> {
                        vo.setLastMessage(last.getContent());
                        vo.setLastMessageTime(last.getSentAt() == null ? null : last.getSentAt().format(DATETIME_FMT));
                    });

            vo.setUnreadCount(coopMessageRepository.countByCoopRequestIdAndSenderDoctorIdNotAndReadFalse(
                    c.getCoopRequestId(), doctorId));

            result.add(vo);
        }

        // 가장 최근에 대화가 오간 방이 위로 오도록 정렬. 아직 메시지가 없는 방(lastMessageTime=null)은 맨 아래로.
        // "yyyy-MM-dd HH:mm:ss" 고정폭 문자열이라 문자열 비교만으로도 시간순 비교가 그대로 성립한다.
        result.sort((a, b) -> {
            String ta = a.getLastMessageTime();
            String tb = b.getLastMessageTime();
            if (ta == null && tb == null) return 0;
            if (ta == null) return 1;
            if (tb == null) return -1;
            return tb.compareTo(ta);
        });

        return result;
    }

    @Override
    public long myTotalUnreadCount(Long doctorId) {
        return coopRequestRepository.findMyChatRooms(doctorId).stream()
                .mapToLong(c -> coopMessageRepository.countByCoopRequestIdAndSenderDoctorIdNotAndReadFalse(
                        c.getCoopRequestId(), doctorId))
                .sum();
    }

    private CoopMessageVO toVO(CoopMessage m, Long viewerId) {
        CoopMessageVO vo = new CoopMessageVO();
        vo.setCoopMessageId(m.getCoopMessageId());
        vo.setCoopRequestId(m.getCoopRequestId());
        vo.setSenderDoctorId(m.getSenderDoctorId());
        vo.setContent(m.getContent());
        vo.setSentAt(m.getSentAt() == null ? null : m.getSentAt().format(DATETIME_FMT));
        vo.setMine(m.getSenderDoctorId().equals(viewerId));
        vo.setRead(m.isRead());
        vo.setMessageType(m.getMessageType());
        memberRepository.findById(m.getSenderDoctorId())
                .ifPresent(mem -> vo.setSenderName(mem.getName()));
        return vo;
    }
}