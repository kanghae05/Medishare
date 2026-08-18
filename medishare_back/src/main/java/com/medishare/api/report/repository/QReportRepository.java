package com.medishare.api.report.repository;

import com.medishare.api.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;

public interface QReportRepository extends JpaRepository<Report, Long>, QuerydslPredicateExecutor<Report> {
    List<Report> findByStudyNoOrderByWriteDateDesc(Long studyNo);
    List<Report> findAllByOrderByWriteDateDesc();
}
