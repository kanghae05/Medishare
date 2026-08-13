package com.medishare.api.member.controller;

import com.medishare.api.member.service.ChangeHistoryQueryService;
import com.medishare.api.member.vo.ChangeHistoryDetailVO;
import com.medishare.api.member.vo.ChangeHistoryListVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/change-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ChangeHistoryAdminController {
    private final ChangeHistoryQueryService changeHistoryQueryService;

    @GetMapping
    public Page<ChangeHistoryListVO> list(@RequestParam(required = false) String memberKeyword,
                                          @RequestParam(required = false) String patientId,
                                          @RequestParam(required = false) String studyKeyword,
                                          @RequestParam(required = false) Long departmentNo,
                                          @RequestParam(required = false) String dataType,
                                          @RequestParam(required = false) String actionType,
                                          @RequestParam(required = false) LocalDate startDate,
                                          @RequestParam(required = false) LocalDate endDate,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return changeHistoryQueryService.list(memberKeyword, patientId, studyKeyword, departmentNo, dataType,
                actionType, startDate, endDate, page, size);
    }

    @GetMapping("/{historyNo}")
    public ChangeHistoryDetailVO detail(@PathVariable Long historyNo) {
        return changeHistoryQueryService.detail(historyNo);
    }
}
