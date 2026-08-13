package com.medishare.api.coop.repository;

import com.medishare.api.pacs.entity.PacsStudy;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * PACS 담당자의 실제 PacsStudy 엔티티(com.medishare.api.pacs.entity)를 그대로 사용한다.
 * 별도 임시 엔티티를 새로 만들지 않으므로, 같은 테이블에 두 Entity가 매핑되면서
 * 생기는 DuplicateMappingException 문제가 애초에 발생하지 않는다.
 *
 * 주의: 이 Repository는 협진(coop) 도메인에서 "조회 전용"으로만 사용한다.
 * save()/delete() 등으로 pacs_study를 절대 수정하지 않는다 (그 테이블은 PACS 담당자 소유).
 */
public interface CoopPacsStudyLookupRepository extends JpaRepository<PacsStudy, Long> {
}