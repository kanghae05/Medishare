package com.medishare.api.member.controller;

import com.medishare.api.member.service.AccessLogQueryService;
import com.medishare.api.member.vo.AccessLogListVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/access-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AccessLogAdminController {
    private final AccessLogQueryService accessLogQueryService;

    @GetMapping
    public Page<AccessLogListVO> list(@RequestParam(required = false) String memberKeyword,
                                      @RequestParam(required = false) String patientId,
                                      @RequestParam(required = false) String studyKeyword,
                                      @RequestParam(required = false) Long departmentNo,
                                      @RequestParam(required = false) String dataType,
                                      @RequestParam(required = false) String actionType,
                                      @RequestParam(required = false) String accessResult,
                                      @RequestParam(required = false) LocalDate startDate,
                                      @RequestParam(required = false) LocalDate endDate,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        return accessLogQueryService.list(memberKeyword, patientId, studyKeyword, departmentNo, dataType, actionType,
                accessResult, startDate, endDate, page, size);
    }

    @GetMapping("/{logNo}")
    public AccessLogListVO detail(@PathVariable Long logNo) { return accessLogQueryService.detail(logNo); }
}
