package com.medishare.api.member.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacsMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long no;

    @Column(name = "login_id", nullable = false, length = 100, unique = true)
    private String loginId;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "member_name", nullable = false, length = 200)
    private String memberName;

    @Column(length = 200, unique = true)
    private String email;

    @Column(length = 30)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_no")
    private PacsDepartment department;

    @Column(length = 100)
    private String position;

    @Column(length = 200)
    private String specialty;

    @Column(nullable = false, length = 20)
    private String status;

    private Boolean stable;
}
