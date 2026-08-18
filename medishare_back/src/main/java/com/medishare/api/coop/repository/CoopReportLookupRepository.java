package com.medishare.api.coop.repository;

import com.medishare.api.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 6번(소견서) 담당자의 실제 Report 엔티티를 조회 전용으로 사용.
 * 검사(study) 하나당 소견서가 사실상 하나라는 전제로, 가장 최근 것 하나만 가져온다.
 * TODO: 6번 담당자가 정식 소견서 조회 API를 만들면 삭제하고 그쪽 API로 교체.
 */
public interface CoopReportLookupRepository extends JpaRepository<Report, Long> {

    /**
     * 검사(study)의 소견서 중, 그 작성자(memberNo)가 쓴 것만 찾는다.
     * 협진 요청에 소견서를 첨부할 땐 "본인이 작성한 소견서만" 첨부 후보로 보여줘야 해서,
     * 작성자 조건 없는 위 메서드 대신 이걸 쓴다.
     * Report.member는 Long이 아니라 Member 연관관계 객체라서, "Member_No"로 그 안의 no를 비교한다.
     */
    Optional<Report> findFirstByStudyNoAndMember_NoOrderByWriteDateDesc(Long studyNo, Long memberNo);
}