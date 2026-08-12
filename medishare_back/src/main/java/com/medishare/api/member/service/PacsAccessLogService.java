package com.medishare.api.member.service;

import com.medishare.api.member.entity.*;
import com.medishare.api.member.repository.*;
import com.medishare.api.pacs.entity.PacsStudy;
import com.medishare.api.pacs.repository.PacsStudyRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PacsAccessLogService {
    private final PacsDataAccessLogRepository accessLogRepository;
    private final PacsMemberRepository memberRepository;
    private final PacsStudyRepository studyRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(Authentication authentication, HttpServletRequest request, String dataType, String actionType, String accessResult, String orthancStudyId) {
        String loginId = loginId(authentication);
        if (loginId == null) return;
        PacsMember member = memberRepository.findByLoginId(loginId).orElse(null);
        if (member == null) return;
        PacsStudy study = orthancStudyId == null ? null : studyRepository.findByOrthancStudyId(orthancStudyId).orElse(null);
        accessLogRepository.save(PacsDataAccessLog.builder().member(member).study(study)
                .patient(study == null ? null : study.getPatient()).dataType(dataType).actionType(actionType)
                .accessResult(accessResult).ipAddress(clientIp(request)).build());
    }

    private String loginId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        Object principal = authentication.getPrincipal();
        return principal instanceof MemberDetails member ? member.getId() : null;
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank() ? request.getRemoteAddr() : forwarded.split(",")[0].trim();
    }
}
