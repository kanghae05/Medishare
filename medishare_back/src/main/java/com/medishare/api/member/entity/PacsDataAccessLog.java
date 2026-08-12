package com.medishare.api.member.entity;

import com.medishare.api.pacs.entity.PacsPatient;
import com.medishare.api.pacs.entity.PacsStudy;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacs_data_access_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PacsDataAccessLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long no;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "member_no", nullable = false) private PacsMember member;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "patient_no") private PacsPatient patient;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "study_no") private PacsStudy study;
    @Column(name = "data_type", nullable = false, length = 50) private String dataType;
    @Column(name = "action_type", nullable = false, length = 50) private String actionType;
    @Column(name = "access_result", nullable = false, length = 20) private String accessResult;
    @Column(name = "ip_address", length = 45) private String ipAddress;
    @Column(name = "accessed_at", nullable = false) private LocalDateTime accessedAt;
    @PrePersist void prePersist() { if (accessedAt == null) accessedAt = LocalDateTime.now(); }
}
