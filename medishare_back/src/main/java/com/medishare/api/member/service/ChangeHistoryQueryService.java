package com.medishare.api.member.service;

import com.medishare.api.member.entity.PacsDataChangeHistory;
import com.medishare.api.member.entity.PacsDepartment;
import com.medishare.api.member.entity.PacsMember;
import com.medishare.api.member.repository.PacsDataChangeHistoryRepository;
import com.medishare.api.member.vo.ChangeHistoryDetailVO;
import com.medishare.api.member.vo.ChangeHistoryListVO;
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
public class ChangeHistoryQueryService {
    private final PacsDataChangeHistoryRepository changeHistoryRepository;

    public Page<ChangeHistoryListVO> list(String memberKeyword, String patientId, String studyKeyword,
                                          Long departmentNo, String dataType, String actionType,
                                          LocalDate startDate, LocalDate endDate, int page, int size) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "changedAt"));
        return changeHistoryRepository.searchChangeHistories(blankToNull(memberKeyword), blankToNull(patientId),
                        blankToNull(studyKeyword), departmentNo, blankToNull(dataType), blankToNull(actionType),
                        startDate == null ? null : startDate.atStartOfDay(),
                        endDate == null ? null : endDate.plusDays(1).atStartOfDay(), pageable)
                .map(this::toListVO);
    }

    public ChangeHistoryDetailVO detail(Long historyNo) {
        return toDetailVO(changeHistoryRepository.findById(historyNo)
                .orElseThrow(() -> new IllegalArgumentException("Change history not found.")));
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private ChangeHistoryListVO toListVO(PacsDataChangeHistory history) {
        CommonFields fields = commonFields(history);
        return ChangeHistoryListVO.builder().historyNo(history.getNo()).memberNo(fields.memberNo()).loginId(fields.loginId())
                .memberName(fields.memberName()).departmentName(fields.departmentName()).patientNo(fields.patientNo())
                .patientId(fields.patientId()).studyNo(fields.studyNo()).studyInstanceUid(fields.studyInstanceUid())
                .dataType(history.getDataType()).actionType(history.getActionType()).changeReason(history.getChangeReason())
                .changedAt(history.getChangedAt()).build();
    }

    private ChangeHistoryDetailVO toDetailVO(PacsDataChangeHistory history) {
        CommonFields fields = commonFields(history);
        return ChangeHistoryDetailVO.builder().historyNo(history.getNo()).memberNo(fields.memberNo()).loginId(fields.loginId())
                .memberName(fields.memberName()).departmentName(fields.departmentName()).patientNo(fields.patientNo())
                .patientId(fields.patientId()).studyNo(fields.studyNo()).studyInstanceUid(fields.studyInstanceUid())
                .dataType(history.getDataType()).actionType(history.getActionType()).changeReason(history.getChangeReason())
                .changedAt(history.getChangedAt()).beforeData(history.getBeforeData()).afterData(history.getAfterData()).build();
    }

    private CommonFields commonFields(PacsDataChangeHistory history) {
        PacsMember member = history.getMember();
        PacsDepartment department = member.getDepartment();
        PacsPatient patient = history.getPatient();
        PacsStudy study = history.getStudy();
        return new CommonFields(member.getNo(), member.getLoginId(), member.getMemberName(),
                department == null ? null : department.getDepartmentName(), patient == null ? null : patient.getNo(),
                patient == null ? null : patient.getPatientId(), study == null ? null : study.getNo(),
                study == null ? null : study.getStudyInstanceUID());
    }

    private record CommonFields(Long memberNo, String loginId, String memberName, String departmentName,
                                Long patientNo, String patientId, Long studyNo, String studyInstanceUid) { }
}
