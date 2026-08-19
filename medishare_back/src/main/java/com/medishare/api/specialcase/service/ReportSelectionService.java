package com.medishare.api.specialcase.service;

import com.medishare.api.pacs.entity.PacsSeries;
import com.medishare.api.pacs.entity.PacsStudy;
import com.medishare.api.pacs.repository.PacsStudyRepository;
import com.medishare.api.report.entity.Report;
import com.medishare.api.report.repository.QReportRepository;
import com.medishare.api.specialcase.dto.ReportSelectionDto;
import com.medishare.api.specialcase.repository.SpecialCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportSelectionService {

    private final QReportRepository reportRepository;
    private final PacsStudyRepository studyRepository;
    private final SpecialCaseRepository specialCaseRepository;

    public List<ReportSelectionDto> list(Long memberNo) {
        return reportRepository.findByMember_NoOrderByWriteDateDesc(memberNo).stream()
                .map(this::toDto)
                .filter(dto -> dto.studyInstanceUid() != null)
                .filter(dto -> !specialCaseRepository.existsActiveByStudyInstanceUid(dto.studyInstanceUid()))
                .toList();
    }

    private ReportSelectionDto toDto(Report report) {
        PacsStudy study = studyRepository.findById(report.getStudyNo()).orElse(null);
        PacsSeries series = study == null ? null : study.getSeriesList().stream()
                .min(Comparator.comparing(PacsSeries::getNo))
                .orElse(null);

        String bodyPart = study == null ? null : firstNotBlank(
                study.getRequestedProcedureDescription(),
                study.getStudyDescription()
        );

        return new ReportSelectionDto(
                report.getNo(),
                report.getStudyNo(),
                report.getTitle(),
                report.getFindings(),
                report.getImpression(),
                report.getStatus(),
                report.getMember().getName(),
                report.getWriteDate(),
                study == null ? null : study.getStudyInstanceUID(),
                series == null ? null : series.getSeriesInstanceUID(),
                series == null ? null : series.getModality(),
                bodyPart,
                study == null ? null : study.getPatient().getPatientName(),
                study == null ? null : study.getPatient().getPatientId()
        );
    }

    private String firstNotBlank(String first, String second) {
        return first != null && !first.isBlank() ? first : second;
    }
}
