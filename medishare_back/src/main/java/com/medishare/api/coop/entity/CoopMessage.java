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

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}
