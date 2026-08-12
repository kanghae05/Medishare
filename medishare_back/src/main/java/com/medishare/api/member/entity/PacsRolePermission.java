package com.medishare.api.member.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role_permission")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PacsRolePermission {
    @EmbeddedId private PacsRolePermissionId id;
    @ManyToOne(fetch = FetchType.LAZY) @MapsId("roleNo") @JoinColumn(name = "role_no") private PacsRole role;
    @ManyToOne(fetch = FetchType.LAZY) @MapsId("permissionNo") @JoinColumn(name = "permission_no") private PacsPermission permission;
}
