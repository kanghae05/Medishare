package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.CoopRequest;
import com.medishare.api.coop.entity.CoopStatus;
import com.medishare.api.coop.entity.QCoopRequest;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CoopRequestRepositoryCustomImpl implements CoopRequestRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    QCoopRequest c = QCoopRequest.coopRequest;

    @Override
    public List<CoopRequest> findReceived(Long doctorId, Long deptId, List<CoopStatus> statuses,
                                          LocalDate from, LocalDate to,
                                          long offset, long limit) {
        return queryFactory.selectFrom(c)
                .where(receivedCondition(doctorId, deptId),
                        statusIn(statuses),
                        dateFrom(from), dateTo(to))
                .orderBy(c.reqTime.desc())
                .offset(offset)
                .limit(limit)
                .fetch();
    }

    @Override
    public long findReceivedCount(Long doctorId, Long deptId, List<CoopStatus> statuses,
                                  LocalDate from, LocalDate to) {
        Long count = queryFactory.select(c.count())
                .from(c)
                .where(receivedCondition(doctorId, deptId),
                        statusIn(statuses),
                        dateFrom(from), dateTo(to))
                .fetchOne();
        return count == null ? 0 : count;
    }

    @Override
    public List<CoopRequest> findSent(Long doctorId, List<CoopStatus> statuses,
                                      LocalDate from, LocalDate to, long offset, long limit) {
        return queryFactory.selectFrom(c)
                .where(c.reqDoctorId.eq(doctorId),
                        statusIn(statuses), dateFrom(from), dateTo(to))
                .orderBy(c.reqTime.desc())
                .offset(offset)
                .limit(limit)
                .fetch();
    }

    @Override
    public long findSentCount(Long doctorId, List<CoopStatus> statuses, LocalDate from, LocalDate to) {
        Long count = queryFactory.select(c.count())
                .from(c)
                .where(c.reqDoctorId.eq(doctorId),
                        statusIn(statuses), dateFrom(from), dateTo(to))
                .fetchOne();
        return count == null ? 0 : count;
    }

    @Override
    public List<CoopRequest> findAllRelated(Long doctorId, Long deptId, List<CoopStatus> statuses,
                                            LocalDate from, LocalDate to, long offset, long limit) {
        return queryFactory.selectFrom(c)
                .where(allRelatedCondition(doctorId, deptId),
                        statusIn(statuses), dateFrom(from), dateTo(to))
                .orderBy(c.reqTime.desc())
                .offset(offset)
                .limit(limit)
                .fetch();
    }

    @Override
    public long findAllRelatedCount(Long doctorId, Long deptId, List<CoopStatus> statuses,
                                    LocalDate from, LocalDate to) {
        Long count = queryFactory.select(c.count())
                .from(c)
                .where(allRelatedCondition(doctorId, deptId),
                        statusIn(statuses), dateFrom(from), dateTo(to))
                .fetchOne();
        return count == null ? 0 : count;
    }

    @Override
    public long countUnread(Long doctorId, Long deptId, List<CoopStatus> statuses) {
        Long count = queryFactory.select(c.count())
                .from(c)
                .where(receivedCondition(doctorId, deptId), statusIn(statuses))
                .fetchOne();
        return count == null ? 0 : count;
    }

    @Override
    public List<CoopRequest> findAllForAdmin(Long reqDoctorId, Long recvDoctorId, Long recvDoctorDeptId, Long deptId,
                                             List<CoopStatus> statuses, LocalDate from, LocalDate to,
                                             long offset, long limit) {
        return queryFactory.selectFrom(c)
                .where(adminCondition(reqDoctorId, recvDoctorId, recvDoctorDeptId, deptId),
                        statusIn(statuses), dateFrom(from), dateTo(to))
                .orderBy(c.reqTime.desc())
                .offset(offset)
                .limit(limit)
                .fetch();
    }

    @Override
    public long findAllForAdminCount(Long reqDoctorId, Long recvDoctorId, Long recvDoctorDeptId, Long deptId,
                                     List<CoopStatus> statuses, LocalDate from, LocalDate to) {
        Long count = queryFactory.select(c.count())
                .from(c)
                .where(adminCondition(reqDoctorId, recvDoctorId, recvDoctorDeptId, deptId),
                        statusIn(statuses), dateFrom(from), dateTo(to))
                .fetchOne();
        return count == null ? 0 : count;
    }

    // ------------------------------------------------------------------
    // 조건 조립 (null 반환 시 QueryDSL이 자동으로 조건 무시 - 선택적 필터에 활용)
    // ------------------------------------------------------------------

    private BooleanBuilder receivedCondition(Long doctorId, Long deptId) {
        BooleanBuilder b = new BooleanBuilder(c.recvDoctorId.eq(doctorId));
        if (deptId != null) {
            b.or(c.recvDeptId.eq(deptId));
        }
        return b;
    }

    private BooleanBuilder allRelatedCondition(Long doctorId, Long deptId) {
        BooleanBuilder b = new BooleanBuilder(c.reqDoctorId.eq(doctorId))
                .or(c.recvDoctorId.eq(doctorId));
        if (deptId != null) {
            b.or(c.recvDeptId.eq(deptId));
        }
        return b;
    }

    /**
     * 관리자 필터 - 전달된 값만 AND로 조립, null인 항목은 조건 자체를 안 건다.
     * recvDoctorId(수신자 검색)는 세 경우를 다 매칭한다:
     *   1) 지정의사로 그 사람에게 직접 간 것 (recv_doctor_id)
     *   2) 진료과 요청인데 그 사람이 이미 수락한 것 (accept_doctor_id)
     *   3) 진료과 요청이 그 사람 소속과로 갔고, 아직 수락 전이라 특정 담당자가 없는 것
     *      (recvDoctorDeptId - Service에서 그 의사의 소속과를 조회해서 넘겨준다)
     * 이게 없으면 "아직 수락 안 된 진료과 요청"은 수신자 검색에서 계속 빠지게 된다.
     */
    private BooleanBuilder adminCondition(Long reqDoctorId, Long recvDoctorId, Long recvDoctorDeptId, Long deptId) {
        BooleanBuilder b = new BooleanBuilder();
        if (reqDoctorId != null) {
            b.and(c.reqDoctorId.eq(reqDoctorId));
        }
        if (recvDoctorId != null) {
            BooleanBuilder recvCond = new BooleanBuilder(c.recvDoctorId.eq(recvDoctorId))
                    .or(c.acceptDoctorId.eq(recvDoctorId));
            if (recvDoctorDeptId != null) {
                recvCond.or(c.recvDeptId.eq(recvDoctorDeptId));
            }
            b.and(recvCond);
        }
        if (deptId != null) {
            b.and(c.recvDeptId.eq(deptId));
        }
        return b;
    }

    private com.querydsl.core.types.dsl.BooleanExpression statusIn(List<CoopStatus> statuses) {
        return (statuses == null || statuses.isEmpty()) ? null : c.status.in(statuses);
    }

    private com.querydsl.core.types.dsl.BooleanExpression dateFrom(LocalDate from) {
        return from == null ? null : c.reqTime.goe(from.atStartOfDay());
    }

    private com.querydsl.core.types.dsl.BooleanExpression dateTo(LocalDate to) {
        return to == null ? null : c.reqTime.lt(to.plusDays(1).atStartOfDay());
    }
}