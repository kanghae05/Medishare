package com.medishare.api.report.service;

import com.medishare.api.report.vo.ReportVO;

import java.util.List;

public interface ReportService {
    ReportVO write(ReportVO vo, String loginMemberId);
    ReportVO view(Long no, String loginMemberId);
    List<ReportVO> list(Long studyNo, String status, String loginMemberId);
    ReportVO update(Long no, ReportVO vo, String loginMemberId, String changeReason);
    void delete(Long no, String loginMemberId, String changeReason);
}
