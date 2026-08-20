package com.medishare.api.coop.service;

import com.medishare.api.coop.vo.ChatRoomVO;
import com.medishare.api.coop.vo.CoopMessageVO;

import java.util.List;

public interface CoopMessageService {

    /** 이 협진요청의 채팅 이력 (오래된 순). 호출 시 상대방이 보낸 메시지를 전부 읽음 처리한다. */
    List<CoopMessageVO> history(Long coopRequestId, Long viewerId);

    /**
     * 메시지 저장 + 방에 접속한 모든 세션한테 실시간 브로드캐스트까지 한 번에 처리한다.
     * WebSocket(텍스트)이든 REST(이미지)든 이 메서드 하나만 호출하면 저장과 전파가 다 된다.
     * messageType: "TEXT" 또는 "IMAGE". content는 IMAGE면 base64 PNG data URL.
     */
    CoopMessageVO send(Long coopRequestId, Long senderId, String content, String messageType);

    /**
     * 이 의사가 그 협진요청의 당사자인지 (채팅방 입장 가능 여부).
     * 요청자 본인 / 지정의사 요청의 수신의사 / 진료과 요청의 소속과 의사 / 이미 수락한 의사.
     * deptId는 소속 진료과가 없는 계정일 수 있어 null 허용.
     */
    boolean isParticipant(Long coopRequestId, Long doctorId, Long deptId);

    /** "대화함" 목록 - 내가 참여 중인 채팅방 전체, 방마다 마지막 메시지 + 안읽은 개수 포함 */
    List<ChatRoomVO> myChatRooms(Long doctorId);

    /** 사이드바 배지용 - 내 모든 채팅방을 통틀어 안읽은 메시지 총개수 */
    long myTotalUnreadCount(Long doctorId);
}