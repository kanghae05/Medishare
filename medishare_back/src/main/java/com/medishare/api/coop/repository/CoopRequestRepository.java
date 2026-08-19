package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.CoopRequest;
import com.medishare.api.coop.entity.CoopStatus;
import com.medishare.api.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CoopRequestRepository extends JpaRepository<CoopRequest, Long>, CoopRequestRepositoryCustom {

    /**
     * 수락 처리 (지정의사 / 진료과 공통)
     * - WHERE status='요청' 조건으로, 먼저 반영된 트랜잭션만 성공한다.
     * - 반환값이 0이면 이미 다른 의사가 처리한 것 (Service에서 예외로 변환해 컨트롤러가 409 처리)
     * - 진료과 요청 특성상 여러 의사가 동시에 수락을 시도할 수 있어, 팀 공통 컨벤션인
     *   "findById → setter → save()" 대신 조건부 UPDATE를 그대로 유지한다.
     */
    @Modifying
    @Query("UPDATE CoopRequest c SET c.status = com.medishare.api.coop.entity.CoopStatus.수락, " +
            "c.acceptDoctorId = :acceptDoctorId, c.respTime = CURRENT_TIMESTAMP " +
            "WHERE c.coopRequestId = :id AND c.status = com.medishare.api.coop.entity.CoopStatus.요청")
    int acceptIfPending(@Param("id") Long id, @Param("acceptDoctorId") Long acceptDoctorId);

    // 거절 처리 (지정의사 요청 전용)
    @Modifying
    @Query("UPDATE CoopRequest c SET c.status = com.medishare.api.coop.entity.CoopStatus.거절, " +
            "c.rejectReason = :rejectReason, c.respTime = CURRENT_TIMESTAMP " +
            "WHERE c.coopRequestId = :id AND c.status = com.medishare.api.coop.entity.CoopStatus.요청")
    int rejectIfPending(@Param("id") Long id, @Param("rejectReason") String rejectReason);

    /**
     * 진료과 요청 - 전원 거절 확정
     * - coop_request_dept_reject에서 "전체 의사 수 == 거절 수"를 확인한 뒤 호출한다.
     * - reject_reason은 CHECK 제약(chk_reject_reason) 때문에 안내 문구를 고정으로 채운다.
     *   (개별 사유는 coop_request_dept_reject에 남아있음)
     */
    @Modifying
    @Query("UPDATE CoopRequest c SET c.status = com.medishare.api.coop.entity.CoopStatus.거절, " +
            "c.rejectReason = '진료과 소속 의사 전원 거절 (개별 사유는 거절기록 참조)', " +
            "c.respTime = CURRENT_TIMESTAMP " +
            "WHERE c.coopRequestId = :id AND c.status = com.medishare.api.coop.entity.CoopStatus.요청")
    int confirmDeptRejectIfPending(@Param("id") Long id);

    // 취소 처리 (지정의사 / 진료과 공통, status='요청'일 때만 가능)
    @Modifying
    @Query("UPDATE CoopRequest c SET c.status = com.medishare.api.coop.entity.CoopStatus.취소 " +
            "WHERE c.coopRequestId = :id AND c.status = com.medishare.api.coop.entity.CoopStatus.요청")
    int cancelIfPending(@Param("id") Long id);

    // ------------------------------------------------------------------
    // 통계(5번) 도메인에서 사용 - "이 의사와 관련된" 협진 건수.
    // StatisticsService.getConsultationStatistics(doctorId, ...) 에서 호출한다.
    // "관련된"의 범위: 그 의사가 요청했거나 / 지정의사로 직접 받았거나 / 수락했거나 /
    // 소속 진료과로 요청이 왔거나(진료과 요청, 수락 여부 무관) - 네 가지를 전부 포함한다.
    // 기간(from/to)은 null이면 그 방향으로는 제한을 안 둔다 (BETRWEEN 대신 개별 비교로 처리 -
    // BETWEEN은 한쪽이 null이면 전체가 매칭 안 되는 문제가 있어서 피한다).
    // TODO: 통계 담당자가 의도한 "관련된"의 정확한 범위가 이거랑 다르면(예: 요청한 것만,
    // 또는 받은 것만) 조건을 좁혀야 한다.
    // ------------------------------------------------------------------

    @Query("SELECT COUNT(c) FROM CoopRequest c " +
            "WHERE (:from IS NULL OR c.reqTime >= :from) " +
            "AND (:to IS NULL OR c.reqTime < :to) " +
            "AND (c.reqDoctorId = :doctorId " +
            "     OR c.recvDoctorId = :doctorId " +
            "     OR c.acceptDoctorId = :doctorId " +
            "     OR c.recvDeptId IN (SELECT m.department.no FROM Member m WHERE m.no = :doctorId AND m.department IS NOT NULL))")
    long countConsultations(@Param("doctorId") Long doctorId,
                            @Param("from") LocalDateTime from,
                            @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(c) FROM CoopRequest c " +
            "WHERE c.status = :status " +
            "AND (:from IS NULL OR c.reqTime >= :from) " +
            "AND (:to IS NULL OR c.reqTime < :to) " +
            "AND (c.reqDoctorId = :doctorId " +
            "     OR c.recvDoctorId = :doctorId " +
            "     OR c.acceptDoctorId = :doctorId " +
            "     OR c.recvDeptId IN (SELECT m.department.no FROM Member m WHERE m.no = :doctorId AND m.department IS NOT NULL))")
    long countConsultationsByStatus(@Param("status") CoopStatus status,
                                    @Param("doctorId") Long doctorId,
                                    @Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to);

    /**
     * "대화함" 목록용 - 내가 참여 중인 채팅방(수락된 협진요청, 요청자 또는 수락자로 참여한 것) 전체.
     * 채팅 자체가 "수락된 것 + 요청자/수락자 둘 뿐"이라는 규칙(CoopMessageService.isParticipant)과 동일하게 맞춘다.
     */
    @Query("SELECT c FROM CoopRequest c " +
            "WHERE c.status = com.medishare.api.coop.entity.CoopStatus.수락 " +
            "AND (c.reqDoctorId = :doctorId OR c.acceptDoctorId = :doctorId) " +
            "ORDER BY c.respTime DESC")
    List<CoopRequest> findMyChatRooms(@Param("doctorId") Long doctorId);
}