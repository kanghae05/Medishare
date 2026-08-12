package com.medishare.api.member.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PacsRole {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;
    @Column(name = "role_code", nullable = false, unique = true, length = 50)
    private String roleCode;
    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;
    @Column(length = 500)
    private String description;
    private Boolean stable;
}
