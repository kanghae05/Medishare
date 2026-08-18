package com.medishare.api.report.service;

import com.medishare.api.member.entity.Member;
import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.member.service.PacsChangeHistoryService;
import com.medishare.api.member.service.MemberRoleAuthorityService;
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
    private final MemberRoleAuthorityService memberRoleAuthorityService;
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
        if ("FINAL".equalsIgnoreCase(savedReport.getStatus())) {
            removeDraftsAfterFinalization(savedReport, loginMemberId);
        }
        return toVO(savedReport);
    }

    @Override
    public ReportVO view(Long no) { return toVO(getReport(no)); }

    @Override
    public List<ReportVO> list(Long studyNo, String status) {
        List<Report> reports = studyNo == null
                ? qReportRepository.findByStatusOrderByWriteDateDesc(status)
                : qReportRepository.findByStudyNoAndStatusOrderByWriteDateDesc(studyNo, status);
        return reports
                .stream().map(this::toVO).toList();
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
        if ("FINAL".equalsIgnoreCase(report.getStatus())) {
            qReportRepository.flush();
            removeDraftsAfterFinalization(report, loginMemberId);
        }
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

    private void removeDraftsAfterFinalization(Report finalReport, String loginMemberId) {
        qReportRepository.findByStudyNoAndStatusAndMember_No(
                        finalReport.getStudyNo(), "DRAFT", finalReport.getMember().getNo())
                .stream()
                .filter((draft) -> !draft.getNo().equals(finalReport.getNo()))
                .forEach((draft) -> {
                    String beforeData = pacsChangeHistoryService.snapshot(draft);
                    pacsChangeHistoryService.recordReportChange(
                            loginMemberId, beforeData, draft, "DELETE", "최종판독 완료로 임시저장 정리");
                    qReportRepository.delete(draft);
                });
    }

    private void validateOwnerOrAdmin(Report report, String loginMemberId) {
        Member loginMember = qMemberRepository.findMemberById(loginMemberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found."));
        boolean isAdmin = memberRoleAuthorityService.getAuthorities(loginMember.getNo()).contains("ROLE_ADMIN");
        if (!isAdmin && !report.getMember().getId().equals(loginMemberId)) {
            throw new AccessDeniedException("Only the author can modify this report.");
        }
    }

    private ReportVO toVO(Report report) {
        return new ReportVO(report.getNo(), report.getStudyNo(), report.getTitle(), report.getFindings(),
                report.getImpression(), report.getStatus(), report.getMember().getId(), report.getMember().getName(),
                report.getWriteDate(), report.getUpdateDate());
    }
}
