package com.medishare.api.member.controller;

import com.medishare.api.member.service.PacsRoleService;
import com.medishare.api.member.vo.PacsPermissionVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/pacs/permissions") @RequiredArgsConstructor
public class PacsPermissionController {
    private final PacsRoleService service;
    @GetMapping("/list.do") public List<PacsPermissionVO> list() { return service.permissionList(); }
    @PostMapping("/write.do") public PacsPermissionVO write(@RequestBody PacsPermissionVO vo) { return service.permissionWrite(vo); }
    @PutMapping("/update.do/{no}") public PacsPermissionVO update(@PathVariable Long no, @RequestBody PacsPermissionVO vo) { return service.permissionUpdate(no, vo); }
}
