package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.PacsPatientRef;
import org.springframework.data.jpa.repository.JpaRepository;

/** 읽기 전용 용도로만 사용 (PacsPatientRef 참고) */
public interface PacsPatientRefRepository extends JpaRepository<PacsPatientRef, Long> {
}