package com.medishare.api.coop.repository;

import com.medishare.api.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 3번 담당자의 실제 Member 엔티티를 조회 전용으로 사용한다.
 * (PacsStudy 때와 동일한 이유로, 같은 테이블에 별도 Entity를 새로 매핑하지 않고
 * 이미 있는 Entity에 Repository만 얹는다.)
 */
public interface CoopMemberLookupRepository extends JpaRepository<Member, Long> {

    /** 특정 진료과(department_no) 소속의 활성 상태 의사 수 */
    long countByDepartment_NoAndStatus(Long departmentNo, String status);
}