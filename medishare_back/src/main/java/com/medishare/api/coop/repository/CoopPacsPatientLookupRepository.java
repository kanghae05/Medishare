package com.medishare.api.coop.repository;

import com.medishare.api.pacs.entity.PacsPatient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * PACS 담당자의 실제 PacsPatient 엔티티를 조회 전용으로 사용 (환자 이름 검색용).
 * TODO: PACS 담당자가 정식 환자 검색 API를 만들면 삭제하고 그쪽 API로 교체.
 */
public interface CoopPacsPatientLookupRepository extends JpaRepository<PacsPatient, Long> {

    @Query("SELECT p FROM PacsPatient p WHERE p.patientName LIKE CONCAT('%', :q, '%') ORDER BY p.patientName")
    List<PacsPatient> searchByName(@Param("q") String q);
}