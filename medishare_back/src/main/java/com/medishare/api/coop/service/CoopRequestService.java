package com.medishare.api.coop.service;

import com.medishare.api.coop.vo.CoopRequestVO;
import com.medishare.api.coop.vo.UnreadCountVO;
import com.medishare.api.util.page.PageObject;

import java.time.LocalDate;
import java.util.List;

public interface CoopRequestService {

    // 받은 협진함 (acceptMode=1)
    List<CoopRequestVO> receivedList(Long doctorId, Long deptId, PageObject pageObject,
                                     List<String> statuses,
                                     LocalDate from, LocalDate to);

    // 보낸 협진함 (acceptMode=2)
    List<CoopRequestVO> sentList(Long doctorId, PageObject pageObject,
                                 List<String> statuses, LocalDate from, LocalDate to);

    // 전체 협진 내역 (acceptMode=3)
    List<CoopRequestVO> allList(Long doctorId, Long deptId, PageObject pageObject,
                                List<String> statuses, LocalDate from, LocalDate to);

    // 상세 조회 - 열람 처리(4-6) 포함, 진료과 요청이면 거절자 목록도 함께 채워 반환
    CoopRequestVO view(Long coopRequestId, Long viewerDoctorId);

    // 등록 (4-1) / 재요청(4-1-1, originRequestId가 있으면 이전 요청의 환자·검사·소견서를 복사)
    CoopRequestVO write(CoopRequestVO vo);

    // 수락 (4-2). 반환값 0이면 이미 다른 의사가 처리한 것
    int accept(Long coopRequestId, Long doctorId, Long viewerDeptId);

    // 거절 - 지정의사 요청 전용 (4-3)
    int reject(Long coopRequestId, Long doctorId, String rejectReason);

    // 거절 - 진료과 요청, 개인별 (4-3-1). 전원 거절 시 자동으로 상태를 '거절'로 확정
    int deptReject(Long coopRequestId, Long doctorId, Long deptId, String rejectReason);

    // 취소 (4-4)
    int cancel(Long coopRequestId, Long doctorId);

    // 안 읽은 개수 (4-7, 폴링용)
    UnreadCountVO unreadCount(Long doctorId, Long deptId);
}