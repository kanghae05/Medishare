package com.medishare.api.member.entity;

import com.medishare.api.pacs.entity.PacsPatient;
import com.medishare.api.pacs.entity.PacsStudy;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_change_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PacsDataChangeHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long no;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "member_no", nullable = false) private PacsMember member;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "patient_no") private PacsPatient patient;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "study_no") private PacsStudy study;
    @Column(name = "data_type", nullable = false, length = 50) private String dataType;
    @Column(name = "action_type", nullable = false, length = 50) private String actionType;
    @Lob @Column(name = "before_data") private String beforeData;
    @Lob @Column(name = "after_data") private String afterData;
    @Column(name = "change_reason", length = 500) private String changeReason;
    @Column(name = "changed_at", nullable = false) private LocalDateTime changedAt;
    @PrePersist void prePersist() { if (changedAt == null) changedAt = LocalDateTime.now(); }
}
