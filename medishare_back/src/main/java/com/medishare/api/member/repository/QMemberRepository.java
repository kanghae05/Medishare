package com.medishare.api.member.repository;

import com.medishare.api.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface QMemberRepository
        extends JpaRepository<Member, String>, QuerydslPredicateExecutor<Member> {
}
