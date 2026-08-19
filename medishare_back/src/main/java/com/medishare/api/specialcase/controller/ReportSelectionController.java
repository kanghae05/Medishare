package com.medishare.api.specialcase.controller;

import com.medishare.api.specialcase.dto.ReportSelectionDto;
import com.medishare.api.specialcase.service.ReportSelectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/** 특이케이스 등록에 사용할 판독소견서 목록 API. */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportSelectionController {

    private final ReportSelectionService reportSelectionService;

    @GetMapping
    public List<ReportSelectionDto> list(Authentication authentication) {
        return reportSelectionService.list(getActorId(authentication));
    }

    private long getActorId(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();
        try {
            Object id = principal.getClass().getMethod("getNo").invoke(principal);
            return id instanceof Number number
                    ? number.longValue()
                    : Long.parseLong(String.valueOf(id));
        } catch (ReflectiveOperationException | NumberFormatException ignored) {
            try {
                return Long.parseLong(authentication.getName());
            } catch (NumberFormatException exception) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            }
        }
    }
}
