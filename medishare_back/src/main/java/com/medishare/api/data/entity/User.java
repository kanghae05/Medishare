package com.medishare.api.data.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table // 테이블 이름을 설정안하면 클래스 이름인 user table을 만든다.
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uid;

    // 객체 -> JSON : 직렬화. 안됨. DB에서 데이터 가져와서 다른 곳에 보낼때 직렬화 시킨다. 비밀번호 제외
    // JSON -> 객체 : 역직렬화. 됨. 가져온 데이터를 DB에서 맞는지 확인.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

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
    public String getUsername() {
        return this.uid;
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
