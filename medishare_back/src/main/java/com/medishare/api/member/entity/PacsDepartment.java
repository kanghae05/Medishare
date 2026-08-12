package com.medishare.api.member.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "department")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacsDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @Column(name = "department_name", nullable = false, length = 100, unique = true)
    private String departmentName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 20)
    private String status;

    private Boolean stable;
}
