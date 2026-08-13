package com.medishare.api.member.repository;
import com.medishare.api.member.entity.PacsDataChangeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PacsDataChangeHistoryRepository extends JpaRepository<PacsDataChangeHistory, Long> {
    @Query("""
            select h from PacsDataChangeHistory h
            where (:memberKeyword is null or lower(h.member.loginId) like lower(concat('%', :memberKeyword, '%'))
                or lower(h.member.memberName) like lower(concat('%', :memberKeyword, '%')))
              and (:patientId is null or lower(h.patient.patientId) like lower(concat('%', :patientId, '%')))
              and (:studyKeyword is null or str(h.study.no) = :studyKeyword
                or lower(h.study.studyInstanceUID) like lower(concat('%', :studyKeyword, '%')))
              and (:departmentNo is null or h.member.department.no = :departmentNo)
              and (:dataType is null or h.dataType = :dataType)
              and (:actionType is null or h.actionType = :actionType)
              and (:startAt is null or h.changedAt >= :startAt)
              and (:endExclusive is null or h.changedAt < :endExclusive)
            """)
    Page<PacsDataChangeHistory> searchChangeHistories(@Param("memberKeyword") String memberKeyword,
                                                       @Param("patientId") String patientId,
                                                       @Param("studyKeyword") String studyKeyword,
                                                       @Param("departmentNo") Long departmentNo,
                                                       @Param("dataType") String dataType,
                                                       @Param("actionType") String actionType,
                                                       @Param("startAt") LocalDateTime startAt,
                                                       @Param("endExclusive") LocalDateTime endExclusive,
                                                       Pageable pageable);
}
