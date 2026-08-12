package com.medishare.api.member.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pacs_permission")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PacsPermission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;
    @Column(name = "permission_code", nullable = false, unique = true, length = 100)
    private String permissionCode;
    @Column(name = "permission_name", nullable = false, length = 100)
    private String permissionName;
    @Column(length = 500)
    private String description;
    private Boolean stable;
}
