package com.medishare.api.member.controller;

import com.medishare.api.member.service.PacsRoleService;
import com.medishare.api.member.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/pacs/roles") @RequiredArgsConstructor
public class PacsRoleController {
    private final PacsRoleService service;
    @GetMapping("/list.do") public List<PacsRoleVO> list() { return service.list(); }
    @PostMapping("/write.do") public PacsRoleVO write(@RequestBody PacsRoleVO vo) { return service.write(vo); }
    @PutMapping("/update.do/{no}") public PacsRoleVO update(@PathVariable Long no, @RequestBody PacsRoleVO vo) { return service.update(no, vo); }
    @PutMapping("/status.do/{no}") public PacsRoleVO status(@PathVariable Long no, @RequestBody Map<String, Boolean> body) { return service.changeStable(no, body.get("stable")); }
    @GetMapping("/{roleNo}/permissions/list.do") public List<PacsPermissionVO> permissions(@PathVariable Long roleNo) { return service.rolePermissions(roleNo); }
    @PostMapping("/{roleNo}/permissions/{permissionNo}") public void grantPermission(@PathVariable Long roleNo, @PathVariable Long permissionNo) { service.grantPermission(roleNo, permissionNo); }
    @DeleteMapping("/{roleNo}/permissions/{permissionNo}") public void revokePermission(@PathVariable Long roleNo, @PathVariable Long permissionNo) { service.revokePermission(roleNo, permissionNo); }
}
