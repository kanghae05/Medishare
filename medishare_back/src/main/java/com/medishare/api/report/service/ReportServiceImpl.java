package com.medishare.api.report.service;

import com.medishare.api.member.entity.Member;
import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.member.service.PacsChangeHistoryService;
import com.medishare.api.report.entity.Report;
import com.medishare.api.report.repository.QReportRepository;
import com.medishare.api.report.vo.ReportVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {
    private final QReportRepository qReportRepository;
    private final QMemberRepository qMemberRepository;
    private final PacsChangeHistoryService pacsChangeHistoryService;

    @Override
    @Transactional
    public ReportVO write(ReportVO vo, String loginMemberId) {
        Member member = qMemberRepository.findMemberById(loginMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found."));
        Report report = Report.builder()
                .studyNo(vo.getStudyNo()).title(vo.getTitle())
                .findings(vo.getFindings()).impression(vo.getImpression())
                .status(vo.getStatus()).member(member).build();
        Report savedReport = qReportRepository.save(report);
        pacsChangeHistoryService.recordReportChange(loginMemberId, null, savedReport, "CREATE", null);
        return toVO(savedReport);
    }

    @Override
    public ReportVO view(Long no) { return toVO(getReport(no)); }

    @Override
    public List<ReportVO> list(Long studyNo) {
        return qReportRepository.findByStudyNoOrderByWriteDateDesc(studyNo).stream().map(this::toVO).toList();
    }

    @Override
    @Transactional
    public ReportVO update(Long no, ReportVO vo, String loginMemberId, String changeReason) {
        Report report = getReport(no);
        validateOwnerOrAdmin(report, loginMemberId);
        String beforeData = pacsChangeHistoryService.snapshot(report);
        report.setTitle(vo.getTitle());
        report.setFindings(vo.getFindings());
        report.setImpression(vo.getImpression());
        report.setStatus(vo.getStatus());
        pacsChangeHistoryService.recordReportChange(loginMemberId, beforeData, report, "UPDATE", changeReason);
        return toVO(report);
    }

    @Override
    @Transactional
    public void delete(Long no, String loginMemberId, String changeReason) {
        Report report = getReport(no);
        validateOwnerOrAdmin(report, loginMemberId);
        String beforeData = pacsChangeHistoryService.snapshot(report);
        pacsChangeHistoryService.recordReportChange(loginMemberId, beforeData, report, "DELETE", changeReason);
        qReportRepository.delete(report);
    }

    private Report getReport(Long no) {
        return qReportRepository.findById(no).orElseThrow(() -> new IllegalArgumentException("Report not found."));
    }

    private void validateOwnerOrAdmin(Report report, String loginMemberId) {
        Member loginMember = qMemberRepository.findMemberById(loginMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found."));
        if (!loginMember.getRoles().contains("ROLE_ADMIN") && !report.getMember().getId().equals(loginMemberId)) {
            throw new AccessDeniedException("Only the author can modify this report.");
        }
    }

    private ReportVO toVO(Report report) {
        return new ReportVO(report.getNo(), report.getStudyNo(), report.getTitle(), report.getFindings(),
                report.getImpression(), report.getStatus(), report.getMember().getId(), report.getMember().getName(),
                report.getWriteDate(), report.getUpdateDate());
    }
}
