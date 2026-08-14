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
}