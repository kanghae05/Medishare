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

    // ------------------------------------------------------------------
    // 조건 조립 (null 반환 시 QueryDSL이 자동으로 조건 무시 - 선택적 필터에 활용)
    // ------------------------------------------------------------------

    private BooleanBuilder receivedCondition(Long doctorId, Long deptId) {
        return new BooleanBuilder(c.recvDoctorId.eq(doctorId))
                .or(c.recvDeptId.eq(deptId));
    }

    private BooleanBuilder allRelatedCondition(Long doctorId, Long deptId) {
        return new BooleanBuilder(c.reqDoctorId.eq(doctorId))
                .or(c.recvDoctorId.eq(doctorId))
                .or(c.recvDeptId.eq(deptId));
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