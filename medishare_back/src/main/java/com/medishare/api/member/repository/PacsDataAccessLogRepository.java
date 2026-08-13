package com.medishare.api.member.repository;
import com.medishare.api.member.entity.PacsDataAccessLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PacsDataAccessLogRepository extends JpaRepository<PacsDataAccessLog, Long> {
    @Query("""
            select l from PacsDataAccessLog l
            where (:memberKeyword is null or lower(l.member.loginId) like lower(concat('%', :memberKeyword, '%'))
                or lower(l.member.memberName) like lower(concat('%', :memberKeyword, '%')))
              and (:patientId is null or lower(l.patient.patientId) like lower(concat('%', :patientId, '%')))
              and (:studyKeyword is null or str(l.study.no) = :studyKeyword
                or lower(l.study.studyInstanceUID) like lower(concat('%', :studyKeyword, '%')))
              and (:departmentNo is null or l.member.department.no = :departmentNo)
              and (:dataType is null or l.dataType = :dataType)
              and (:actionType is null or l.actionType = :actionType)
              and (:accessResult is null or l.accessResult = :accessResult)
              and (:startAt is null or l.accessedAt >= :startAt)
              and (:endExclusive is null or l.accessedAt < :endExclusive)
            """)
    Page<PacsDataAccessLog> searchAccessLogs(@Param("memberKeyword") String memberKeyword,
                                             @Param("patientId") String patientId,
                                             @Param("studyKeyword") String studyKeyword,
                                             @Param("departmentNo") Long departmentNo,
                                             @Param("dataType") String dataType,
                                             @Param("actionType") String actionType,
                                             @Param("accessResult") String accessResult,
                                             @Param("startAt") LocalDateTime startAt,
                                             @Param("endExclusive") LocalDateTime endExclusive,
                                             Pageable pageable);
}
