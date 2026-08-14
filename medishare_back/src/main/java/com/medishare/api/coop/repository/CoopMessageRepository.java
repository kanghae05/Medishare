package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.CoopMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoopMessageRepository extends JpaRepository<CoopMessage, Long> {

    List<CoopMessage> findByCoopRequestIdOrderBySentAtAsc(Long coopRequestId);
}