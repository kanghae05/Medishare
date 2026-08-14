package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.CoopRequest;
import com.medishare.api.coop.entity.CoopStatus;

import java.time.LocalDate;
import java.util.List;

/**
 * 받은/보낸/전체 협진함 조회 - 상태 다중선택, 기간 등 선택적 필터가
 * 여러 개 조합되므로 QueryDSL로 동적 조건을 구성한다. (CoopRequestRepositoryCustomImpl 참고)
 */
public interface CoopRequestRepositoryCustom {

    // 받은 협진함 (지정의사로 나에게 온 것 OR 진료과로 내 소속과에 온 것)
    List<CoopRequest> findReceived(Long doctorId, Long deptId, List<CoopStatus> statuses,
                                   LocalDate from, LocalDate to,
                                   long offset, long limit);

    long findReceivedCount(Long doctorId, Long deptId, List<CoopStatus> statuses,
                           LocalDate from, LocalDate to);

    // 보낸 협진함
    List<CoopRequest> findSent(Long doctorId, List<CoopStatus> statuses,
                               LocalDate from, LocalDate to, long offset, long limit);

    long findSentCount(Long doctorId, List<CoopStatus> statuses, LocalDate from, LocalDate to);

    // 전체 협진 내역 (받은 것 + 보낸 것)
    List<CoopRequest> findAllRelated(Long doctorId, Long deptId, List<CoopStatus> statuses,
                                     LocalDate from, LocalDate to, long offset, long limit);

    long findAllRelatedCount(Long doctorId, Long deptId, List<CoopStatus> statuses,
                             LocalDate from, LocalDate to);

    // 응답 대기 중인 개수 (배지/폴링용) - statuses는 Service에서 (요청)으로 고정해 전달
    long countUnread(Long doctorId, Long deptId, List<CoopStatus> statuses);
}