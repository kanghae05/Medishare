package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.CoopRequest;
import com.medishare.api.coop.entity.CoopStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CoopRequestRepository extends JpaRepository<CoopRequest, Long>, CoopRequestRepositoryCustom {

    /*
    수락 처리 (지정의사 / 진료과 공통)
    - WHERE status='요청' 조건으로, 먼저 반영된 트랜잭션만 성공한다.
    - 반환값이 0이면 이미 다른 의사가 처리한 것 (Service에서 예외로 변환해 컨트롤러가 409 처리)
    - 진료과 요청 특성상 여러 의사가 동시에 수락을 시도할 수 있어, 팀 공통 컨벤션인
      "findById → setter → save()" 대신 조건부 UPDATE를 그대로 유지한다.
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

    /*
    진료과 요청 - 전원 거절 확정
    - coop_request_dept_reject에서 "전체 의사 수 == 거절 수"를 확인한 뒤 호출한다.
    - reject_reason은 CHECK 제약(chk_reject_reason) 때문에 안내 문구를 고정으로 채운다.
      (개별 사유는 coop_request_dept_reject에 남아있음)
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
}