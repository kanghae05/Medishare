package com.medishare.api.member.service;

import com.medishare.api.member.entity.MemberDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public interface MemberDetailsService {

    // 사용자 상세 정보를 가져오는데 정보가 없으면 UsernameNotFoundException을 발생시켜서 던진다.
    MemberDetails loadMemberById(String id)
        throws UsernameNotFoundException;

}
