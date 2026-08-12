package com.medishare.api.member.service;

import com.medishare.api.member.entity.PacsMemberRole;
import com.medishare.api.member.repository.PacsMemberRepository;
import com.medishare.api.member.repository.PacsMemberRoleRepository;
import com.medishare.api.member.repository.PacsRolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("pacsAuthorization")
@RequiredArgsConstructor
public class PacsAuthorizationService {
    private final PacsMemberRepository pacsMemberRepository;
    private final PacsMemberRoleRepository pacsMemberRoleRepository;
    private final PacsRolePermissionRepository pacsRolePermissionRepository;

    @Transactional(readOnly = true)
    public boolean hasPermission(Authentication authentication, String permissionCode) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        if (authentication.getAuthorities().stream().anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()))) return true;
        String loginId = authentication.getPrincipal() instanceof com.medishare.api.member.entity.MemberDetails memberDetails ? memberDetails.getId() : null;
        if (loginId == null) return false;
        return pacsMemberRepository.findByLoginId(loginId).filter(member -> "ACTIVE".equals(member.getStatus()))
                .map(member -> pacsMemberRoleRepository.findByIdMemberNo(member.getNo())).stream().flatMap(java.util.Collection::stream)
                .filter(memberRole -> Boolean.TRUE.equals(memberRole.getRole().getStable()))
                .flatMap(memberRole -> pacsRolePermissionRepository.findByIdRoleNo(memberRole.getRole().getNo()).stream())
                .map(rolePermission -> rolePermission.getPermission())
                .anyMatch(permission -> Boolean.TRUE.equals(permission.getStable()) && permissionCode.equals(permission.getPermissionCode()));
    }
}
