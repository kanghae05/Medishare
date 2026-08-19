package com.medishare.api.coop.service;

import com.medishare.api.coop.entity.CoopMessage;
import com.medishare.api.coop.entity.CoopRequest;
import com.medishare.api.coop.entity.CoopStatus;
import com.medishare.api.coop.repository.CoopMemberLookupRepository;
import com.medishare.api.coop.repository.CoopMessageRepository;
import com.medishare.api.coop.repository.CoopRequestRepository;
import com.medishare.api.coop.vo.CoopMessageVO;
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

    @Override
    public List<CoopMessageVO> history(Long coopRequestId, Long viewerId) {
        return coopMessageRepository.findByCoopRequestIdOrderBySentAtAsc(coopRequestId).stream()
                .map(m -> toVO(m, viewerId))
                .toList();
    }

    @Override
    @Transactional
    public CoopMessageVO send(Long coopRequestId, Long senderId, String content) {
        if (content == null || content.isBlank()) {
            throw new RuntimeException("메시지 내용을 입력해주세요.");
        }
        CoopMessage saved = coopMessageRepository.save(
                CoopMessage.builder()
                        .coopRequestId(coopRequestId)
                        .senderDoctorId(senderId)
                        .content(content.trim())
                        .build()
        );
        // 보낸 사람 본인 기준으로 변환해서 반환 (WebSocket 브로드캐스트 시 받는 사람마다 mine을 다시 계산해서 내려준다)
        return toVO(saved, senderId);
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

    private CoopMessageVO toVO(CoopMessage m, Long viewerId) {
        CoopMessageVO vo = new CoopMessageVO();
        vo.setCoopMessageId(m.getCoopMessageId());
        vo.setCoopRequestId(m.getCoopRequestId());
        vo.setSenderDoctorId(m.getSenderDoctorId());
        vo.setContent(m.getContent());
        vo.setSentAt(m.getSentAt() == null ? null : m.getSentAt().format(DATETIME_FMT));
        vo.setMine(m.getSenderDoctorId().equals(viewerId));
        memberRepository.findById(m.getSenderDoctorId())
                .ifPresent(mem -> vo.setSenderName(mem.getName()));
        return vo;
    }
}
