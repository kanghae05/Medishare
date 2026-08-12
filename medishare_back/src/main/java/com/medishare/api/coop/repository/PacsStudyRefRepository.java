package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.PacsStudyRef;
import org.springframework.data.jpa.repository.JpaRepository;

/** 읽기 전용 용도로만 사용 (PacsStudyRef 참고) */
public interface PacsStudyRefRepository extends JpaRepository<PacsStudyRef, Long> {
}