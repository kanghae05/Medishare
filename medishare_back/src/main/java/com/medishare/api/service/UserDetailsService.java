package com.medishare.api.service;

import com.medishare.api.data.entity.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface UserDetailsService {

    // 사용자 상세 정보를 가져오는데 정보가 없으면 UsernameNotFoundException을 발생시켜서 던진다.
    UserDetails loadUserByUsername(String username)
        throws UsernameNotFoundException;

}
