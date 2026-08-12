package com.medishare.api.member.repository;
import com.medishare.api.member.entity.PacsDataAccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PacsDataAccessLogRepository extends JpaRepository<PacsDataAccessLog, Long> { }
