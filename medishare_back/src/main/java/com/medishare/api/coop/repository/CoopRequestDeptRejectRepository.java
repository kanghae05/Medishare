package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.CoopRequestDeptReject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoopRequestDeptRejectRepository extends JpaRepository<CoopRequestDeptReject, Long> {

    // 같은 의사가 같은 요청에 중복 거절하지 않았는지 확인 (UNIQUE 제약과 이중 방어)
    boolean existsByCoopRequestIdAndDoctorId(Long coopRequestId, Long doctorId);

    // 현재까지 이 요청에 거절한 의사 수 (전원 거절 여부 판단용)
    long countByCoopRequestId(Long coopRequestId);

    // 보낸 협진함 상세에서 "누가 왜 거절했는지" 노출 (의사명+사유)
    List<CoopRequestDeptReject> findByCoopRequestIdOrderByRejectedAtAsc(Long coopRequestId);
}