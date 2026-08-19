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

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}