package com.medishare.api.service.impl;

import com.medishare.api.data.entity.UserDetails;
import com.medishare.api.data.repository.UserRepository;
import com.medishare.api.service.UserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // private final 변수를 생성자를 이용해서 자동 DI를 시킨다.
@Log4j2
public class UserDetailsServiceImpl implements UserDetailsService {

    // @RequiredArgsConstructor 때문에 생성자에 의해서 자동 DI 적용
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("[loadUserByUsername] loadUserByUsername 수행, username : {}", username);
        return userRepository.getByUid(username);
    }
}
