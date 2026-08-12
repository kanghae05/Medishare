package com.medishare.api.member.service;

import com.medishare.api.member.entity.*;
import com.medishare.api.member.repository.*;
import com.medishare.api.member.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class PacsRoleServiceImpl implements PacsRoleService {
    private final PacsRoleRepository roleRepository; private final PacsPermissionRepository permissionRepository;
    private final PacsMemberRepository memberRepository; private final PacsMemberRoleRepository memberRoleRepository; private final PacsRolePermissionRepository rolePermissionRepository;
    public List<PacsRoleVO> list() { return roleRepository.findAll().stream().map(this::roleVO).toList(); }
    @Transactional public PacsRoleVO write(PacsRoleVO vo) { required(vo.getRoleCode(), "Role code"); required(vo.getRoleName(), "Role name"); roleRepository.findByRoleCode(vo.getRoleCode()).ifPresent(r -> { throw new IllegalArgumentException("Role code already exists."); }); return roleVO(roleRepository.save(PacsRole.builder().roleCode(vo.getRoleCode()).roleName(vo.getRoleName()).description(vo.getDescription()).stable(vo.getStable() == null || vo.getStable()).build())); }
    @Transactional public PacsRoleVO update(Long no, PacsRoleVO vo) { PacsRole role = role(no); required(vo.getRoleCode(), "Role code"); required(vo.getRoleName(), "Role name"); roleRepository.findByRoleCode(vo.getRoleCode()).filter(r -> !r.getNo().equals(no)).ifPresent(r -> { throw new IllegalArgumentException("Role code already exists."); }); role.setRoleCode(vo.getRoleCode()); role.setRoleName(vo.getRoleName()); role.setDescription(vo.getDescription()); if (vo.getStable() != null) role.setStable(vo.getStable()); return roleVO(role); }
    @Transactional public PacsRoleVO changeStable(Long no, Boolean stable) { if (stable == null) throw new IllegalArgumentException("Stable is required."); PacsRole role = role(no); role.setStable(stable); return roleVO(role); }
    public List<PacsPermissionVO> permissionList() { return permissionRepository.findAll().stream().map(this::permissionVO).toList(); }
    @Transactional public PacsPermissionVO permissionWrite(PacsPermissionVO vo) { required(vo.getPermissionCode(), "Permission code"); required(vo.getPermissionName(), "Permission name"); permissionRepository.findByPermissionCode(vo.getPermissionCode()).ifPresent(p -> { throw new IllegalArgumentException("Permission code already exists."); }); return permissionVO(permissionRepository.save(PacsPermission.builder().permissionCode(vo.getPermissionCode()).permissionName(vo.getPermissionName()).description(vo.getDescription()).stable(vo.getStable() == null || vo.getStable()).build())); }
    @Transactional public PacsPermissionVO permissionUpdate(Long no, PacsPermissionVO vo) { PacsPermission permission = permission(no); required(vo.getPermissionCode(), "Permission code"); required(vo.getPermissionName(), "Permission name"); permissionRepository.findByPermissionCode(vo.getPermissionCode()).filter(p -> !p.getNo().equals(no)).ifPresent(p -> { throw new IllegalArgumentException("Permission code already exists."); }); permission.setPermissionCode(vo.getPermissionCode()); permission.setPermissionName(vo.getPermissionName()); permission.setDescription(vo.getDescription()); if (vo.getStable() != null) permission.setStable(vo.getStable()); return permissionVO(permission); }
    public List<PacsPermissionVO> rolePermissions(Long roleNo) { role(roleNo); return rolePermissionRepository.findByIdRoleNo(roleNo).stream().map(link -> permissionVO(link.getPermission())).toList(); }
    @Transactional public void grantPermission(Long roleNo, Long permissionNo) { PacsRole role = role(roleNo); PacsPermission permission = permission(permissionNo); PacsRolePermissionId id = new PacsRolePermissionId(roleNo, permissionNo); if (!rolePermissionRepository.existsById(id)) rolePermissionRepository.save(PacsRolePermission.builder().id(id).role(role).permission(permission).build()); }
    @Transactional public void revokePermission(Long roleNo, Long permissionNo) { if (!rolePermissionRepository.existsById(new PacsRolePermissionId(roleNo, permissionNo))) throw new IllegalArgumentException("Role permission not found."); rolePermissionRepository.deleteById(new PacsRolePermissionId(roleNo, permissionNo)); }
    public List<PacsRoleVO> memberRoles(Long memberNo) { member(memberNo); return memberRoleRepository.findByIdMemberNo(memberNo).stream().map(link -> roleVO(link.getRole())).toList(); }
    @Transactional public void grantMemberRole(Long memberNo, Long roleNo) { PacsMember member = member(memberNo); PacsRole role = role(roleNo); PacsMemberRoleId id = new PacsMemberRoleId(memberNo, roleNo); if (!memberRoleRepository.existsById(id)) memberRoleRepository.save(PacsMemberRole.builder().id(id).member(member).role(role).build()); }
    @Transactional public void revokeMemberRole(Long memberNo, Long roleNo) { if (!memberRoleRepository.existsById(new PacsMemberRoleId(memberNo, roleNo))) throw new IllegalArgumentException("Member role not found."); memberRoleRepository.deleteById(new PacsMemberRoleId(memberNo, roleNo)); }
    private PacsRole role(Long no) { return roleRepository.findById(no).orElseThrow(() -> new IllegalArgumentException("Role not found.")); }
    private PacsPermission permission(Long no) { return permissionRepository.findById(no).orElseThrow(() -> new IllegalArgumentException("Permission not found.")); }
    private PacsMember member(Long no) { return memberRepository.findById(no).orElseThrow(() -> new IllegalArgumentException("PACS member not found.")); }
    private void required(String value, String name) { if (value == null || value.isBlank()) throw new IllegalArgumentException(name + " is required."); }
    private PacsRoleVO roleVO(PacsRole role) { PacsRoleVO vo = new PacsRoleVO(); vo.setNo(role.getNo()); vo.setRoleCode(role.getRoleCode()); vo.setRoleName(role.getRoleName()); vo.setDescription(role.getDescription()); vo.setStable(role.getStable()); return vo; }
    private PacsPermissionVO permissionVO(PacsPermission permission) { PacsPermissionVO vo = new PacsPermissionVO(); vo.setNo(permission.getNo()); vo.setPermissionCode(permission.getPermissionCode()); vo.setPermissionName(permission.getPermissionName()); vo.setDescription(permission.getDescription()); vo.setStable(permission.getStable()); return vo; }
}
