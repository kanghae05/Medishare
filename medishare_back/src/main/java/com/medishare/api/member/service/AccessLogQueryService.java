package com.medishare.api.member.service;

import com.medishare.api.member.entity.PacsDataAccessLog;
import com.medishare.api.member.entity.PacsDepartment;
import com.medishare.api.member.entity.PacsMember;
import com.medishare.api.member.repository.PacsDataAccessLogRepository;
import com.medishare.api.member.vo.AccessLogListVO;
import com.medishare.api.pacs.entity.PacsPatient;
import com.medishare.api.pacs.entity.PacsStudy;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccessLogQueryService {
    private final PacsDataAccessLogRepository accessLogRepository;

    public Page<AccessLogListVO> list(String memberKeyword, String patientId, String studyKeyword,
                                      Long departmentNo, String dataType, String actionType, String accessResult,
                                      LocalDate startDate, LocalDate endDate, int page, int size) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) throw new IllegalArgumentException("Start date cannot be after end date.");
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(Sort.Direction.DESC, "accessedAt"));
        return accessLogRepository.searchAccessLogs(blankToNull(memberKeyword), blankToNull(patientId), blankToNull(studyKeyword),
                departmentNo, blankToNull(dataType), blankToNull(actionType), blankToNull(accessResult),
                startDate == null ? null : startDate.atStartOfDay(), endDate == null ? null : endDate.plusDays(1).atStartOfDay(), pageable)
                .map(this::toVO);
    }

    public AccessLogListVO detail(Long logNo) {
        return toVO(accessLogRepository.findById(logNo).orElseThrow(() -> new IllegalArgumentException("Access log not found.")));
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private AccessLogListVO toVO(PacsDataAccessLog log) {
        PacsMember member = log.getMember();
        PacsDepartment department = member.getDepartment();
        PacsPatient patient = log.getPatient();
        PacsStudy study = log.getStudy();
        return AccessLogListVO.builder().logNo(log.getNo()).memberNo(member.getNo()).loginId(member.getLoginId())
                .memberName(member.getMemberName()).departmentName(department == null ? null : department.getDepartmentName())
                .patientNo(patient == null ? null : patient.getNo()).patientId(patient == null ? null : patient.getPatientId())
                .studyNo(study == null ? null : study.getNo()).studyInstanceUid(study == null ? null : study.getStudyInstanceUID())
                .dataType(log.getDataType()).actionType(log.getActionType()).accessResult(log.getAccessResult())
                .ipAddress(log.getIpAddress()).accessedAt(log.getAccessedAt()).build();
    }
}
