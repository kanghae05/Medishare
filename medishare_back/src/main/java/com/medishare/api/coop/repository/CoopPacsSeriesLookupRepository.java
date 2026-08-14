package com.medishare.api.coop.repository;

import com.medishare.api.pacs.entity.PacsSeries;
import org.springframework.data.jpa.repository.JpaRepository;

/** PACS 담당자의 실제 PacsSeries 엔티티를 조회 전용으로 사용 (검사당 시리즈 여러 개 지원용). */
public interface CoopPacsSeriesLookupRepository extends JpaRepository<PacsSeries, Long> {
}