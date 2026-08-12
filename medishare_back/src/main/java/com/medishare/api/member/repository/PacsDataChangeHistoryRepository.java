package com.medishare.api.member.repository;
import com.medishare.api.member.entity.PacsDataChangeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PacsDataChangeHistoryRepository extends JpaRepository<PacsDataChangeHistory, Long> { }
