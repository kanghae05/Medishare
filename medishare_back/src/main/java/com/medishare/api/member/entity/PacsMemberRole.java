package com.medishare.api.member.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacs_member_role")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PacsMemberRole {
    @EmbeddedId private PacsMemberRoleId id;
    @ManyToOne(fetch = FetchType.LAZY) @MapsId("memberNo") @JoinColumn(name = "member_no") private PacsMember member;
    @ManyToOne(fetch = FetchType.LAZY) @MapsId("roleNo") @JoinColumn(name = "role_no") private PacsRole role;
    @Column(name = "assigned_at", nullable = false) private LocalDateTime assignedAt;
    @PrePersist void prePersist() { if (assignedAt == null) assignedAt = LocalDateTime.now(); }
}
