package com.medishare.api.member.repository;

import com.medishare.api.member.entity.PacsMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PacsMemberRepository extends JpaRepository<PacsMember, Long> {
    Optional<PacsMember> findByLoginId(String loginId);
    Optional<PacsMember> findByEmail(String email);
}
