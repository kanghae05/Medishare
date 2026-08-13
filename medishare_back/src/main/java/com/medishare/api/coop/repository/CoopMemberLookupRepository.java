package com.medishare.api.coop.repository;

import com.medishare.api.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 3번 담당자의 실제 Member 엔티티를 조회 전용으로 사용한다.
 * (PacsStudy 때와 동일한 이유로, 같은 테이블에 별도 Entity를 새로 매핑하지 않고
 * 이미 있는 Entity에 Repository만 얹는다.)
 */
public interface CoopMemberLookupRepository extends JpaRepository<Member, Long> {

    /** 특정 진료과(department_no) 소속의 활성 상태 의사 수 */
    long countByDepartment_NoAndStatus(Long departmentNo, String status);

    /**
     * 이름/세부전공/진료과명 중 하나라도 검색어를 포함하는 활성 의사 검색.
     * 협진 요청 등록 폼의 "받는 의사" 자동완성용.
     * excludeNo: 검색하는 본인 계정은 결과에서 제외 (자기 자신에게 협진 요청 불가)
     *
     * TODO(3번 회원관리 연동): role(의사/관리자 구분)이 정식으로 필드화되면
     * 관리자는 결과에서 제외하도록 조건을 추가한다. 지금은 그 필드가 없어서
     * status='ACTIVE'인 계정이면 관리자든 의사든 다 검색되는 상태다.
     */
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.department " +
            "WHERE m.status = 'ACTIVE' " +
            "AND m.no <> :excludeNo " +
            "AND (m.name LIKE CONCAT('%', :q, '%') " +
            "  OR m.specialty LIKE CONCAT('%', :q, '%') " +
            "  OR m.department.departmentName LIKE CONCAT('%', :q, '%')) " +
            "ORDER BY m.name")
    List<Member> searchDoctors(@Param("q") String q, @Param("excludeNo") Long excludeNo);
}