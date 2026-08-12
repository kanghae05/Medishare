package com.medishare.api.member.repository;
import com.medishare.api.member.entity.PacsRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PacsRoleRepository extends JpaRepository<PacsRole, Long> { Optional<PacsRole> findByRoleCode(String roleCode); }
