package com.medishare.api.pacs.repository;

import com.medishare.api.pacs.entity.PacsPatient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PacsPatientRepository extends JpaRepository<PacsPatient, Long> {
}