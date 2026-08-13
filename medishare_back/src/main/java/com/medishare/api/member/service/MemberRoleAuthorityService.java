package com.medishare.api.member.service;

import com.medishare.api.member.repository.MemberRoleAuthorityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberRoleAuthorityService {
    private final MemberRoleAuthorityRepository memberRoleAuthorityRepository;

    @Transactional(readOnly = true)
    public List<String> getAuthorities(Long memberNo) {
        List<String> roles = memberRoleAuthorityRepository.findRoleCodesByMemberNo(memberNo).stream()
                .filter(role -> role != null && !role.isBlank())
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .distinct()
                .toList();
        return roles.isEmpty() ? List.of("ROLE_USER") : roles;
    }
}
