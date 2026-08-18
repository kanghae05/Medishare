package com.medishare.api.member.service;

import com.medishare.api.member.entity.MemberDetails;
import com.medishare.api.member.entity.PacsDataAccessLog;
import com.medishare.api.member.entity.PacsMember;
import com.medishare.api.member.repository.PacsDataAccessLogRepository;
import com.medishare.api.member.repository.PacsMemberRepository;
import com.medishare.api.pacs.entity.PacsStudy;
import com.medishare.api.pacs.repository.PacsStudyRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
public class PacsAccessLogService {

    private final PacsDataAccessLogRepository accessLogRepository;
    private final PacsMemberRepository memberRepository;
    private final PacsStudyRepository studyRepository;

    /**
     * PACS 의료 데이터 접근 이력 기록
     *
     * @param authentication 현재 로그인 사용자
     * @param request        HTTP 요청
     * @param dataType       PATIENT / STUDY / IMAGE ...
     * @param actionType     VIEW / DOWNLOAD ...
     * @param accessResult   SUCCESS / DENIED
     * @param orthancStudyId Orthanc Study ID. 없으면 null
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(
            Authentication authentication,
            HttpServletRequest request,
            String dataType,
            String actionType,
            String accessResult,
            String orthancStudyId
    ) {
        String loginId = getLoginId(authentication);

        // 현재 로그인 사용자를 식별할 수 없는 경우 기록하지 않는다.
        // data_access_log.member_no가 NOT NULL이기 때문이다.
        if (loginId == null) {
            log.debug(
                    "[PacsAccessLog] 로그인 사용자를 확인할 수 없어 접근 로그를 기록하지 않습니다. uri={}",
                    request.getRequestURI()
            );
            return;
        }

        PacsMember member = memberRepository.findByLoginId(loginId)
                .orElse(null);

        if (member == null) {
            log.warn(
                    "[PacsAccessLog] 회원을 찾을 수 없습니다. loginId={}, uri={}",
                    loginId,
                    request.getRequestURI()
            );
            return;
        }

        PacsStudy study = findStudy(orthancStudyId);

        PacsDataAccessLog accessLog = PacsDataAccessLog.builder()
                .member(member)
                .study(study)
                .patient(study != null ? study.getPatient() : null)
                .dataType(dataType)
                .actionType(actionType)
                .accessResult(accessResult)
                .ipAddress(getClientIp(request))
                .build();

        accessLogRepository.save(accessLog);

        log.info(
                "[PacsAccessLog] accessLog saved. loginId={}, dataType={}, actionType={}, " +
                        "accessResult={}, studyId={}, studyNo={}, patientNo={}, uri={}",
                loginId,
                dataType,
                actionType,
                accessResult,
                orthancStudyId,
                study != null ? study.getNo() : null,
                study != null && study.getPatient() != null
                        ? study.getPatient().getNo()
                        : null,
                request.getRequestURI()
        );
    }

    /**
     * 로그인 사용자 식별
     */
    private String getLoginId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        if (!authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof MemberDetails memberDetails) {
            return memberDetails.getId();
        }

        return null;
    }

    /**
     * Orthanc Study ID로 PACS Study 조회
     */
    private PacsStudy findStudy(String orthancStudyId) {
        if (orthancStudyId == null || orthancStudyId.isBlank()) {
            return null;
        }

        return studyRepository.findByOrthancStudyId(orthancStudyId)
                .orElse(null);
    }

    /**
     * 클라이언트 IP 조회
     */
    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");

        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }

        return request.getRemoteAddr();
    }
}