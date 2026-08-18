package com.medishare.api.specialcase.controller;

import com.medishare.api.specialcase.dto.ReportSelectionDto;
import com.medishare.api.specialcase.service.ReportSelectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 특이케이스 등록에 사용할 판독소견서 목록 API. */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportSelectionController {

    private final ReportSelectionService reportSelectionService;

    @GetMapping
    public List<ReportSelectionDto> list() {
        return reportSelectionService.list();
    }
}
