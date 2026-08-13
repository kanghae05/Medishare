package com.medishare.api.member.repository;

import com.medishare.api.member.entity.Member;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/** Reads the existing member_roles/role tables without creating another member mapping. */
public interface MemberRoleAuthorityRepository extends Repository<Member, Long> {

    @Query(value = """
            select r.role_code
            from member_roles mr
            join role r on r.no = mr.role_no
            where mr.member_no = :memberNo
              and (r.stable = true or r.stable is null)
            """, nativeQuery = true)
    List<String> findRoleCodesByMemberNo(@Param("memberNo") Long memberNo);
}
