package com.medishare.api.member.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Data
// 날짜 자동 세팅
@EntityListeners(AuditingEntityListener.class)
@Table
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Check(constraints = "gender in ('남자','여자')")
public class Member implements MemberDetails {

    @Id
    private String id;

    // 객체 -> JSON : 직렬화. 안됨. DB에서 데이터 가져와서 다른 곳에 보낼때 직렬화 시킨다. 비밀번호 제외
    // JSON -> 객체 : 역직렬화. 됨. 가져온 데이터를 DB에서 맞는지 확인.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String pw;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private LocalDateTime birth;

    private String tel;

    private String postNo;
    private String address;

    @Column(nullable = false)
    private String email;

    @CreatedDate
    @Column(updatable = false) // 한번 등록하면 변경하지 않는다.
    private LocalDateTime writeDate;

    // 로그인을 하면 현재 날자와 시간으로 변경시킨다.
    @CreatedDate
    private LocalDateTime conDate;

    // 1:n 관계의 별도의 테이블을 만들고 조회 시 즉시 조회한다.(FetchType.EAGER)
    @ElementCollection(fetch = FetchType.EAGER)
    @Builder.Default // new ArrayList<>() 를 보장한다. 데이터가 없어도 null이 되는 것을 막는다.
    // table로 생성 -> user_roles. user_id - user(id)와 연결
    private List<String> roles = new ArrayList<>();

    //--------- 보안 처리에 필요한 메서드들 선언 : UserDetails 인터페이스에 있다.

    // 계정이 가지고 있는 권한 목록 보안 처리를 위해서 필요한 객체(SimpleGrantedAuthority) 변환해서 넘겨준다.
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.roles.stream().map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    // 사용자 이름
    // 객체 -> JSON : 직렬화. 안됨. DB에서 데이터 가져와서 다른 곳에 보낼때 직렬화 시킨다. 사용자 이름 제외
    // JSON -> 객체 : 역직렬화. 됨. 가져온 데이터를 DB에서 맞는지 확인.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Override
    public String getPw() {
        return this.pw;
    }

    // 계정이 만료되지 않았는지
    // 객체 -> JSON : 직렬화. 안됨. DB에서 데이터 가져와서 다른 곳에 보낼때 직렬화 시킨다. 사용자 이름 제외
    // JSON -> 객체 : 역직렬화. 됨. 가져온 데이터를 DB에서 맞는지 확인.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 계정이 잠겨있지 않았는지?
    // 객체 -> JSON : 직렬화. 안됨. DB에서 데이터 가져와서 다른 곳에 보낼때 직렬화 시킨다. 사용자 이름 제외
    // JSON -> 객체 : 역직렬화. 됨. 가져온 데이터를 DB에서 맞는지 확인.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // 비밀번호가 잠겨 있지 않는지?
    // 객체 -> JSON : 직렬화. 안됨. DB에서 데이터 가져와서 다른 곳에 보낼때 직렬화 시킨다. 사용자 이름 제외
    // JSON -> 객체 : 역직렬화. 됨. 가져온 데이터를 DB에서 맞는지 확인.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 계정이 활성화되어 있는지?
    // 객체 -> JSON : 직렬화. 안됨. DB에서 데이터 가져와서 다른 곳에 보낼때 직렬화 시킨다. 사용자 이름 제외
    // JSON -> 객체 : 역직렬화. 됨. 가져온 데이터를 DB에서 맞는지 확인.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Override
    public boolean isEnabled() {
        return true;
    }

}
