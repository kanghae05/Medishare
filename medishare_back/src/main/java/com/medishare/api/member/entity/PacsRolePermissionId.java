package com.medishare.api.member.entity;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class PacsRolePermissionId implements Serializable { private Long roleNo; private Long permissionNo; }
