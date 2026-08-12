package com.medishare.api.member.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medishare.api.member.entity.*;
import com.medishare.api.member.repository.*;
import com.medishare.api.pacs.entity.PacsStudy;
import com.medishare.api.pacs.repository.PacsStudyRepository;
import com.medishare.api.report.entity.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PacsChangeHistoryService {
    private final PacsDataChangeHistoryRepository changeHistoryRepository;
    private final PacsMemberRepository memberRepository;
    private final PacsStudyRepository studyRepository;
    private final ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordReportChange(String loginId, String beforeData, Report after, String actionType, String changeReason) {
        PacsMember member = memberRepository.findByLoginId(loginId).orElse(null);
        if (member == null) return;
        Report source = after;
        if (source == null && beforeData == null) return;
        PacsStudy study = source == null ? null : studyRepository.findById(source.getStudyNo()).orElse(null);
        changeHistoryRepository.save(PacsDataChangeHistory.builder().member(member).study(study)
                .patient(study == null ? null : study.getPatient()).dataType("REPORT").actionType(actionType)
                .beforeData(beforeData).afterData("DELETE".equals(actionType) ? null : snapshot(after)).changeReason(changeReason).build());
    }

    public String snapshot(Report report) {
        if (report == null) return null;
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("reportNo", report.getNo()); data.put("studyNo", report.getStudyNo()); data.put("title", report.getTitle());
        data.put("findings", report.getFindings()); data.put("impression", report.getImpression()); data.put("status", report.getStatus());
        try { return objectMapper.writeValueAsString(data); }
        catch (JsonProcessingException e) { throw new IllegalStateException("Unable to serialize report history.", e); }
    }
}
