package com.medishare.api.coop.vo;

import lombok.Data;

/** "채팅" 목록의 채팅방 한 건 */
@Data
public class ChatRoomVO {
    private Long coopRequestId;
    private String counterpartName;   // 상대방(나 아닌 쪽) 이름
    private String counterpartMeta;   // 진료과 · 세부전공 · 직급
    private String patientName;       // 어떤 환자 건인지 - 여러 방 중에 구분할 때 필요
    private String reqDate;           // 협진 요청 날짜(yyyy-MM-dd) - 같은 상대방과 여러 건으로 채팅할 수 있어 구분용
    private String lastMessage;       // 마지막 메시지 미리보기 (없으면 null)
    private String lastMessageTime;
    private long unreadCount;
}