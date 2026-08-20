package com.medishare.api.coop.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 협진 요청 건별 채팅 메시지.
 * coop_request 하나당 채팅방 하나(1:N) - 그 요청의 당사자들끼리만 주고받는다.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "coop_message")
public class CoopMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long coopMessageId;

    @Column(name = "coop_request_id", nullable = false)
    private Long coopRequestId;

    @Column(name = "sender_doctor_id", nullable = false)
    private Long senderDoctorId;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    // 상대방이 이 메시지를 읽었는지. 채팅방엔 항상 딱 두 사람(요청자/수락자)뿐이라
    // "상대방이 읽었나"가 애매할 일이 없다 - coop_request의 is_read를 없앴던 이유(다중 수신자)와는 다른 상황.
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    // TEXT 또는 IMAGE. IMAGE면 content엔 텍스트가 아니라 base64 PNG data URL이 들어있다
    // (영상에 그림을 그려서 보낸 것 - 별도 파일 스토리지 없이 채팅 메시지 안에 그대로 담아 간단하게 처리).
    @Builder.Default
    @Column(name = "message_type", nullable = false, length = 10)
    private String messageType = "TEXT";

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}