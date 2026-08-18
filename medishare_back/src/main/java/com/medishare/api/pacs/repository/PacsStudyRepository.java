package com.medishare.api.pacs.repository;

import com.medishare.api.pacs.entity.PacsStudy;
import com.medishare.api.pacs.vo.StudyVO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PacsStudyRepository
        extends JpaRepository<PacsStudy, Long>,
        PacsStudyRepositoryCustom {


    Optional<PacsStudy> findByOrthancStudyId(
            String orthancStudyId
    );


    Optional<PacsStudy> findByStudyInstanceUID(
            String studyInstanceUID
    );


    boolean existsByOrthancStudyId(
            String orthancStudyId
    );


    boolean existsByStudyInstanceUID(
            String studyInstanceUID
    );


    // =========================================================
    // PACS Study 목록 조회
    // =========================================================
    @Query("""
        select new com.medishare.api.pacs.vo.StudyVO(
            s.no,
            s.orthancStudyId,
            p.patientId,
            p.patientName,
            p.patientSex,
            p.patientBirthDate,
            s.studyInstanceUID,
            s.studyDate,
            s.studyTime,
            s.studyDescription,
            s.seriesCount,
            s.instanceCount,
            s.stable
        )
        from PacsStudy s
        join s.patient p
        order by s.no desc
    """)
    List<StudyVO> findStudyList();
}