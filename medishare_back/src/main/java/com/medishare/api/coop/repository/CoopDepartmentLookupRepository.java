package com.medishare.api.coop.repository;

import com.medishare.api.member.entity.PacsDepartment;
import org.springframework.data.jpa.repository.JpaRepository;

/** 진료과 전체 목록(드롭다운용) 조회 전용 - PacsStudy/Member 때와 동일한 이유로 별도 Entity 없이 이미 있는 Entity에 Repository만 얹는다. */
public interface CoopDepartmentLookupRepository extends JpaRepository<PacsDepartment, Long> {
}