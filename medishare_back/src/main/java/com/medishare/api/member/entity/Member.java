package com.medishare.api.member.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Data @Builder @NoArgsConstructor @AllArgsConstructor
@Table(name = "member")
public class Member implements MemberDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long no;
    @Column(name = "login_id", nullable = false, length = 100, unique = true) private String id;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) @Column(name = "password", nullable = false, length = 255) private String pw;
    @Column(name = "member_name", nullable = false, length = 200) private String name;
    @Column(length = 200) private String email;
    @Column(name = "phone", length = 30) private String tel;
    @Column(nullable = false, length = 20) @Builder.Default private String status = "ACTIVE";
    private Boolean stable;
    @Transient private String gender;
    @Transient private LocalDateTime birth;
    @Transient private String postNo;
    @Transient private String address;
    @Transient private LocalDateTime writeDate;
    @Transient private LocalDateTime conDate;
    @Transient @Builder.Default private List<String> roles = new ArrayList<>(List.of("ROLE_USER"));
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return roles.stream().map(SimpleGrantedAuthority::new).toList(); }
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) @Override public String getPw() { return pw; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return "ACTIVE".equals(status); }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return "ACTIVE".equals(status); }
}
