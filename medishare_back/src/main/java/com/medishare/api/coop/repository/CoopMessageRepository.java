package com.medishare.api.coop.repository;

import com.medishare.api.coop.entity.CoopMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CoopMessageRepository extends JpaRepository<CoopMessage, Long> {

    List<CoopMessage> findByCoopRequestIdOrderBySentAtAsc(Long coopRequestId);

    Optional<CoopMessage> findFirstByCoopRequestIdOrderBySentAtDesc(Long coopRequestId);

    /** 이 채팅방에서, 내가(viewerId) 보낸 게 아니면서 아직 안 읽은 메시지 개수 - 대화함 배지용 */
    long countByCoopRequestIdAndSenderDoctorIdNotAndReadFalse(Long coopRequestId, Long viewerId);

    /** 채팅방 열람 시, 상대방이 보낸 메시지를 전부 읽음 처리 */
    @Modifying
    @Query("UPDATE CoopMessage m SET m.read = true " +
            "WHERE m.coopRequestId = :coopRequestId AND m.senderDoctorId <> :viewerId AND m.read = false")
    int markAsRead(@Param("coopRequestId") Long coopRequestId, @Param("viewerId") Long viewerId);
}