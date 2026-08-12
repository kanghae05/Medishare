package com.medishare.api.member.controller;

import com.medishare.api.member.service.PacsRoleService;
import com.medishare.api.member.vo.PacsRoleVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/pacs/members") @RequiredArgsConstructor
public class PacsMemberRoleController {
    private final PacsRoleService service;
    @GetMapping("/{memberNo}/roles/list.do") public List<PacsRoleVO> roles(@PathVariable Long memberNo) { return service.memberRoles(memberNo); }
    @PostMapping("/{memberNo}/roles/{roleNo}") public void grant(@PathVariable Long memberNo, @PathVariable Long roleNo) { service.grantMemberRole(memberNo, roleNo); }
    @DeleteMapping("/{memberNo}/roles/{roleNo}") public void revoke(@PathVariable Long memberNo, @PathVariable Long roleNo) { service.revokeMemberRole(memberNo, roleNo); }
}
