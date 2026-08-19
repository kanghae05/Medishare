package com.medishare.api.report.repository;

import com.medishare.api.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;

public interface QReportRepository extends JpaRepository<Report, Long>, QuerydslPredicateExecutor<Report> {
    List<Report> findByStatusOrderByWriteDateDesc(String status);
    List<Report> findByStatusAndMember_NoOrderByWriteDateDesc(String status, Long memberNo);
    List<Report> findByMember_NoOrderByWriteDateDesc(Long memberNo);
    List<Report> findByStudyNoOrderByWriteDateDesc(Long studyNo);
    List<Report> findByStudyNoAndStatusOrderByWriteDateDesc(Long studyNo, String status);
    List<Report> findByStudyNoAndStatusAndMember_NoOrderByWriteDateDesc(Long studyNo, String status, Long memberNo);
    List<Report> findByStudyNoAndStatusAndMember_No(Long studyNo, String status, Long memberNo);
    List<Report> findAllByOrderByWriteDateDesc();
}
