package com.medishare.api.member.service;
import com.medishare.api.member.vo.*;
import java.util.List;
public interface PacsRoleService {
    List<PacsRoleVO> list(); PacsRoleVO write(PacsRoleVO vo); PacsRoleVO update(Long no, PacsRoleVO vo); PacsRoleVO changeStable(Long no, Boolean stable);
    List<PacsPermissionVO> permissionList(); PacsPermissionVO permissionWrite(PacsPermissionVO vo); PacsPermissionVO permissionUpdate(Long no, PacsPermissionVO vo);
    List<PacsPermissionVO> rolePermissions(Long roleNo); void grantPermission(Long roleNo, Long permissionNo); void revokePermission(Long roleNo, Long permissionNo);
    List<PacsRoleVO> memberRoles(Long memberNo); void grantMemberRole(Long memberNo, Long roleNo); void revokeMemberRole(Long memberNo, Long roleNo);
}
