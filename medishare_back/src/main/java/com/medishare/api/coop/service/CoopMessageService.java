package com.medishare.api.coop.service;

import com.medishare.api.coop.vo.CoopMessageVO;

import java.util.List;

public interface CoopMessageService {

    /** 이 협진요청의 채팅 이력 (오래된 순) */
    List<CoopMessageVO> history(Long coopRequestId, Long viewerId);

    /** 메시지 저장 후, 화면에 바로 붙일 수 있는 형태로 반환 (WebSocket 브로드캐스트에 사용) */
    CoopMessageVO send(Long coopRequestId, Long senderId, String content);

    /**
     * 이 의사가 그 협진요청의 당사자인지 (채팅방 입장 가능 여부).
     * 요청자 본인 / 지정의사 요청의 수신의사 / 진료과 요청의 소속과 의사 / 이미 수락한 의사.
     * deptId는 소속 진료과가 없는 계정일 수 있어 null 허용.
     */
    boolean isParticipant(Long coopRequestId, Long doctorId, Long deptId);
}
