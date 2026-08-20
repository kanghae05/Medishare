package com.medishare.api.coop.vo;

import lombok.Data;

/** 채팅 메시지 한 건 - REST 이력조회와 WebSocket 실시간 전송 둘 다에 쓰는 공용 형태 */
@Data
public class CoopMessageVO {
    private Long coopMessageId;
    private Long coopRequestId;
    private Long senderDoctorId;
    private String senderName;   // 실제 이름 (본인이어도 "나"로 치환하지 않음 - 채팅에선 항상 실명이 자연스럽다)
    private String content;
    private String sentAt;       // "yyyy-MM-dd HH:mm:ss"
    private boolean mine;        // 이 메시지를 받는(조회하는) 사람이 보낸 것인지 - 말풍선 좌/우 배치용
    private boolean read;        // 상대방이 읽었는지 - 내가 보낸 메시지(mine=true)에만 화면에 표시한다
    private String messageType;  // "TEXT" 또는 "IMAGE" - IMAGE면 content가 base64 PNG data URL
}