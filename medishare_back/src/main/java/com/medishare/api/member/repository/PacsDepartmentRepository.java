package com.medishare.api.member.repository;

import com.medishare.api.member.entity.PacsDepartment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PacsDepartmentRepository extends JpaRepository<PacsDepartment, Long> {
    Optional<PacsDepartment> findByDepartmentName(String departmentName);
}
