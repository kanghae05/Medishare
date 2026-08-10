package com.medishare.api.member.entity;

import org.springframework.security.core.GrantedAuthority;

import java.io.Serializable;
import java.util.Collection;

public interface MemberDetails extends Serializable {

    // 계정이 가지고 있는 권한 목록 보안 처리를 위해서 필요한 객체(SimpleGrantedAuthority) 변환해서 넘겨준다.
    Collection<? extends GrantedAuthority> getAuthorities();

    String getPw();

    // 사용자 이름 - ID
    String getId();

    // 계정이 만료되지 않았는지
    boolean isAccountNonExpired();

    // 계정이 잠겨있지 않았는지?
    boolean isAccountNonLocked();

    // 비밀번호가 잠겨 있지 않는지?
    boolean isCredentialsNonExpired();

    // 계정이 활성화되어 있는지?
    boolean isEnabled();

}
