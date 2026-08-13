package com.medishare.api.coop.repository;

import com.medishare.api.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 6번(소견서) 담당자의 실제 Report 엔티티를 조회 전용으로 사용.
 * 검사(study) 하나당 소견서가 사실상 하나라는 전제로, 가장 최근 것 하나만 가져온다.
 * TODO: 6번 담당자가 정식 소견서 조회 API를 만들면 삭제하고 그쪽 API로 교체.
 */
public interface CoopReportLookupRepository extends JpaRepository<Report, Long> {

    Optional<Report> findFirstByStudyNoOrderByWriteDateDesc(Long studyNo);
}