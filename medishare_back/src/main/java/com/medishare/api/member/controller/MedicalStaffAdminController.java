package com.medishare.api.member.controller;

import com.medishare.api.member.service.MedicalStaffService;
import com.medishare.api.member.vo.MedicalStaffDetailVO;
import com.medishare.api.member.vo.MedicalStaffListVO;
import com.medishare.api.member.vo.MedicalStaffStatusVO;
import com.medishare.api.member.vo.MedicalStaffUpdateVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/medical-staff")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MedicalStaffAdminController {
    private final MedicalStaffService medicalStaffService;

    @GetMapping
    public Page<MedicalStaffListVO> list(@RequestParam(required = false) String keyword,
                                         @RequestParam(required = false) Long departmentNo,
                                         @RequestParam(required = false) String status,
                                         @PageableDefault(size = 10, sort = "no") Pageable pageable) {
        return medicalStaffService.list(keyword, departmentNo, status, pageable);
    }

    @GetMapping("/{memberNo}")
    public MedicalStaffDetailVO detail(@PathVariable Long memberNo) { return medicalStaffService.detail(memberNo); }

    @PutMapping("/{memberNo}")
    public MedicalStaffDetailVO update(@PathVariable Long memberNo, @RequestBody MedicalStaffUpdateVO request) {
        return medicalStaffService.update(memberNo, request);
    }

    @PatchMapping("/{memberNo}/status")
    public MedicalStaffDetailVO changeStatus(@PathVariable Long memberNo, @RequestBody MedicalStaffStatusVO request) {
        return medicalStaffService.changeStatus(memberNo, request.getStatus());
    }
}
