package com.medishare.api.coop.service;

import com.medishare.api.coop.entity.CoopMessage;
import com.medishare.api.coop.entity.CoopRequest;
import com.medishare.api.coop.entity.RecvType;
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
        if (doctorId.equals(c.getReqDoctorId())) {
            return true;
        }
        if (doctorId.equals(c.getAcceptDoctorId())) {
            return true;
        }
        if (c.getRecvType() == RecvType.지정의사) {
            return doctorId.equals(c.getRecvDoctorId());
        }
        // 진료과 요청: 소속과가 일치하면 당사자 (아직 응답 전인 동료도 채팅 참여는 가능하게 둔다 - 협의 목적)
        return deptId != null && deptId.equals(c.getRecvDeptId());
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