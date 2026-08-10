package com.medishare.api.member.service;

import com.medishare.api.member.entity.MemberDetails;
import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.service.UserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // private final 변수를 생성자를 이용해서 자동 DI를 시킨다.
@Log4j2
public class MemberDetailsServiceImpl implements MemberDetailsService {

    // @RequiredArgsConstructor 때문에 생성자에 의해서 자동 DI 적용
    private final QMemberRepository qMemberRepository;

    @Override
    public MemberDetails loadMemberById(String id) throws UsernameNotFoundException {
        log.info("[loadUserByUsername] loadUserByUsername 수행, id : {}", id);
        // getReferenceById 인 경우 ploxy를 사용해서 실제적으로 DB를 가져오지 않아서 문제가 생긴다.
        return qMemberRepository.findById(id)
                .orElseThrow(() ->
                        new UsernameNotFoundException(id));
    }
}
