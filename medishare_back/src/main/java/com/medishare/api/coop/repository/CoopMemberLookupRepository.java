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
     * 관리자 제외는 여기서 안 하고, findAdminMemberIds()로 따로 관리자 ID를 뽑아서
     * Controller에서 걸러낸다 (Member 엔티티가 role을 어떻게 매핑하는지 몰라도
     * member_role/role 테이블을 네이티브 SQL로 직접 조회하면 안전하게 되니까).
     */
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.department " +
            "WHERE m.status = 'ACTIVE' " +
            "AND m.no <> :excludeNo " +
            "AND (m.name LIKE CONCAT('%', :q, '%') " +
            "  OR m.specialty LIKE CONCAT('%', :q, '%') " +
            "  OR m.department.departmentName LIKE CONCAT('%', :q, '%')) " +
            "ORDER BY m.name")
    List<Member> searchDoctors(@Param("q") String q, @Param("excludeNo") Long excludeNo);

    /**
     * 여러 명의 이름/진료과를 한 번에 조회 (관리자 목록처럼 한 화면에 의사가 여러 명 나올 때 사용).
     * LEFT JOIN FETCH로 진료과까지 같이 가져와서, 행마다 따로 진료과를 다시 조회하는 N+1을 막는다.
     */
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.department WHERE m.no IN :ids")
    List<Member> findAllByIdWithDepartment(@Param("ids") java.util.Collection<Long> ids);

    /** ROLE_ADMIN을 가진 회원번호 목록 (member_role + role 테이블 직접 조회) */
    @Query(value = "SELECT mr.member_no FROM member_role mr " +
            "JOIN role r ON mr.role_no = r.no " +
            "WHERE r.role_code = 'ROLE_ADMIN'", nativeQuery = true)
    List<Long> findAdminMemberIds();
}