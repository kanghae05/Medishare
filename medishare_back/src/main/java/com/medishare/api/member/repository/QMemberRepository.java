package com.medishare.api.member.repository;

import com.medishare.api.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import java.util.Optional;

public interface QMemberRepository
        extends JpaRepository<Member, Long>, QuerydslPredicateExecutor<Member> {

    Optional<Member> findMemberById(String id);
    Optional<Member> findMemberByEmail(String email);

    @Query("""
            select m from Member m
            where (:keyword is null or lower(m.name) like lower(concat('%', :keyword, '%'))
                or lower(m.id) like lower(concat('%', :keyword, '%'))
                or lower(m.email) like lower(concat('%', :keyword, '%')))
              and (:departmentNo is null or m.department.no = :departmentNo)
              and (:status is null or m.status = :status)
            """)
    Page<Member> searchMedicalStaff(@Param("keyword") String keyword,
                                    @Param("departmentNo") Long departmentNo,
                                    @Param("status") String status,
                                    Pageable pageable);
}
