package com.medishare.api.coop.service;

import com.medishare.api.coop.entity.CoopRequest;
import com.medishare.api.coop.entity.CoopRequestDeptReject;
import com.medishare.api.coop.entity.CoopStatus;
import com.medishare.api.coop.entity.RecvType;
import com.medishare.api.coop.repository.CoopRequestDeptRejectRepository;
import com.medishare.api.coop.repository.CoopRequestRepository;
import com.medishare.api.coop.repository.CoopPacsStudyLookupRepository;
import com.medishare.api.coop.repository.CoopMemberLookupRepository;
import com.medishare.api.coop.repository.CoopDepartmentLookupRepository;
import com.medishare.api.coop.vo.CoopRequestDeptRejectVO;
import com.medishare.api.coop.vo.CoopRequestVO;
import com.medishare.api.coop.vo.UnreadCountVO;
import com.medishare.api.util.page.PageObject;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import com.medishare.api.member.entity.Member;

@Service
@RequiredArgsConstructor
public class CoopRequestServiceImpl implements CoopRequestService {

    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final List<CoopStatus> DEFAULT_RECEIVED_STATUSES =
            List.of(CoopStatus.요청, CoopStatus.수락, CoopStatus.거절, CoopStatus.만료); // 취소는 기본 제외
    private static final List<CoopStatus> PENDING_STATUSES = List.of(CoopStatus.요청); // 배지/점 표시 기준 - "지금 응답이 필요한 것"만

    private final CoopRequestRepository coopRequestRepository;
    private final CoopRequestDeptRejectRepository deptRejectRepository;
    private final CoopPacsStudyLookupRepository pacsStudyRepository;
    private final CoopMemberLookupRepository memberRepository;
    private final CoopDepartmentLookupRepository departmentRepository;

    // 의사명/진료과명은 CoopMemberLookupRepository/CoopDepartmentLookupRepository로 채운다 (toVO 참고).
    // 조회하는 본인(viewerId)과 같은 사람이면 이름 대신 "나"로 표시한다.
    // 환자명/검사설명은 PACS 담당자의 실제 엔티티(PacsStudy -> PacsStudy.getPatient())를 조회 전용으로 가져다 쓴다.

    // ------------------------------------------------------------------
    // 조회
    // ------------------------------------------------------------------

    @Override
    public List<CoopRequestVO> receivedList(Long doctorId, Long deptId, PageObject pageObject,
                                            List<String> statuses,
                                            LocalDate from, LocalDate to) {
        List<CoopStatus> statusList = resolveStatuses(statuses, DEFAULT_RECEIVED_STATUSES);

        long total = coopRequestRepository.findReceivedCount(doctorId, deptId, statusList, from, to);
        pageObject.setTotalRow(total);

        List<CoopRequest> list = coopRequestRepository.findReceived(
                doctorId, deptId, statusList, from, to,
                pageObject.getLimit(), pageObject.getPerPageNum());

        List<CoopRequestVO> result = new ArrayList<>();
        for (CoopRequest c : list) {
            CoopRequestVO vo = toVO(c, doctorId);
            vo.setDirection("received");
            applyDisplayStatus(vo, c, doctorId, deptId);
            result.add(vo);
        }
        return result;
    }

    @Override
    public List<CoopRequestVO> sentList(Long doctorId, PageObject pageObject,
                                        List<String> statuses, LocalDate from, LocalDate to) {
        List<CoopStatus> statusList = resolveStatuses(statuses, List.of(CoopStatus.values()));

        long total = coopRequestRepository.findSentCount(doctorId, statusList, from, to);
        pageObject.setTotalRow(total);

        List<CoopRequest> list = coopRequestRepository.findSent(
                doctorId, statusList, from, to, pageObject.getLimit(), pageObject.getPerPageNum());

        List<CoopRequestVO> result = new ArrayList<>();
        for (CoopRequest c : list) {
            CoopRequestVO vo = toVO(c, doctorId);
            vo.setDirection("sent");
            // 보낸 협진함은 요청자 본인 시점이라 별도 계산 없이 실제 status를 그대로 노출
            vo.setDisplayStatus(c.getStatus().name());
            vo.setCanRespond(false);
            result.add(vo);
        }
        return result;
    }

    @Override
    public List<CoopRequestVO> allList(Long doctorId, Long deptId, PageObject pageObject,
                                       List<String> statuses, LocalDate from, LocalDate to) {
        List<CoopStatus> statusList = resolveStatuses(statuses, List.of(CoopStatus.values()));

        long total = coopRequestRepository.findAllRelatedCount(doctorId, deptId, statusList, from, to);
        pageObject.setTotalRow(total);

        List<CoopRequest> list = coopRequestRepository.findAllRelated(
                doctorId, deptId, statusList, from, to, pageObject.getLimit(), pageObject.getPerPageNum());

        List<CoopRequestVO> result = new ArrayList<>();
        for (CoopRequest c : list) {
            CoopRequestVO vo = toVO(c, doctorId);
            boolean isSent = c.getReqDoctorId().equals(doctorId);
            vo.setDirection(isSent ? "sent" : "received");
            if (isSent) {
                vo.setDisplayStatus(c.getStatus().name());
                vo.setCanRespond(false);
            } else {
                applyDisplayStatus(vo, c, doctorId, deptId);
            }
            result.add(vo);
        }
        return result;
    }

    @Override
    @Transactional
    public CoopRequestVO view(Long coopRequestId, Long viewerDoctorId, Long viewerDeptId, boolean isAdmin) {
        CoopRequest c = findEntity(coopRequestId);

        CoopRequestVO vo = toVO(c, viewerDoctorId);
        boolean isSent = c.getReqDoctorId().equals(viewerDoctorId);
        vo.setDirection(isSent ? "sent" : "received");
        if (isSent) {
            vo.setDisplayStatus(c.getStatus().name());
            vo.setCanRespond(false);
        } else {
            applyDisplayStatus(vo, c, viewerDoctorId, viewerDeptId);
        }

        // 재요청이면 이전 요청 내용을 참고용으로 같이 보여준다 (환자/검사/수신대상은 원본과 동일하니 내용만).
        if (c.getOriginRequestId() != null) {
            coopRequestRepository.findById(c.getOriginRequestId()).ifPresent(origin -> {
                vo.setOriginReqContent(origin.getReqContent());
                vo.setOriginReqTime(origin.getReqTime() == null ? null : origin.getReqTime().format(DATETIME_FMT));
            });
        }

        // 진료과 요청의 개인별 거절 상세(누가/왜)는 요청자(보낸 사람) 또는 관리자한테만 보여준다.
        // 같은 과 동료들끼리는 서로의 거절 사유를 볼 필요가 없고, 오히려 솔직하게
        // 사유를 적기 부담스러워질 수 있어서 지정의사 요청처럼(=상세 없이) 보이게 한다.
        // 관리자는 감사/조회 목적이라 이 프라이버시 고려 대상이 아니라서 예외로 둔다.
        if ((isSent || isAdmin) && c.getRecvType() == RecvType.진료과) {
            List<CoopRequestDeptRejectVO> rejections = new ArrayList<>();
            for (CoopRequestDeptReject r : deptRejectRepository.findByCoopRequestIdOrderByRejectedAtAsc(coopRequestId)) {
                CoopRequestDeptRejectVO rv = new CoopRequestDeptRejectVO();
                rv.setDoctorId(r.getDoctorId());
                // TODO(3번 연동): rv.setDoctorName(...)
                rv.setRejectReason(r.getRejectReason());
                rv.setRejectedAt(r.getRejectedAt() == null ? null : r.getRejectedAt().format(DATETIME_FMT));
                rejections.add(rv);
            }
            vo.setDeptRejections(rejections);
        }

        return vo;
    }

    // ------------------------------------------------------------------
    // 등록 / 재요청
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public CoopRequestVO write(CoopRequestVO vo) {
        RecvType recvType = RecvType.valueOf(vo.getRecvType());

        Long pacsStudyId = vo.getPacsStudyId();
        Long reportId = vo.getReportId();

        // 재요청 (4-1-1) - 이전 요청의 검사/소견서를 그대로 복사
        // (환자는 patient_id 컬럼 삭제 후 pacs_study -> patient로 자동 연결되므로 별도 복사 불필요)
        if (vo.getOriginRequestId() != null) {
            CoopRequest origin = findEntity(vo.getOriginRequestId());
            pacsStudyId = origin.getPacsStudyId();
            reportId = origin.getReportId();
        }

        validateCreate(recvType, vo.getReqDoctorId(), vo.getRecvDoctorId(), vo.getRecvDeptId(), pacsStudyId, vo.getReqContent());

        CoopRequest entity = CoopRequest.builder()
                .reqDoctorId(vo.getReqDoctorId())
                .recvType(recvType)
                .recvDoctorId(recvType == RecvType.지정의사 ? vo.getRecvDoctorId() : null)
                .recvDeptId(recvType == RecvType.진료과 ? vo.getRecvDeptId() : null)
                .pacsStudyId(pacsStudyId)
                .reportId(reportId)
                .originRequestId(vo.getOriginRequestId())
                .reqContent(vo.getReqContent())
                .status(CoopStatus.요청)
                .build();

        return toVO(coopRequestRepository.save(entity), vo.getReqDoctorId());
    }

    private void validateCreate(RecvType recvType, Long reqDoctorId, Long recvDoctorId, Long recvDeptId,
                                Long pacsStudyId, String reqContent) {
        if (recvType == RecvType.지정의사) {
            if (recvDoctorId == null) {
                throw new RuntimeException("지정의사 요청은 수신 의사를 선택해야 합니다.");
            }
            if (reqDoctorId.equals(recvDoctorId)) {
                throw new RuntimeException("본인에게는 협진을 요청할 수 없습니다.");
            }
        } else if (recvType == RecvType.진료과) {
            if (recvDeptId == null) {
                throw new RuntimeException("진료과 요청은 수신 진료과를 선택해야 합니다.");
            }
        }
        if (pacsStudyId == null) {
            throw new RuntimeException("검사를 선택해야 합니다.");
        }
        if (reqContent == null || reqContent.isBlank()) {
            throw new RuntimeException("요청 내용을 입력해야 합니다.");
        }
    }

    // ------------------------------------------------------------------
    // 상태 변경 (동시성 가드 - 조건부 UPDATE 그대로 사용)
    // ------------------------------------------------------------------

    @Override
    @Transactional
    public int accept(Long coopRequestId, Long doctorId, Long viewerDeptId) {
        CoopRequest c = findEntity(coopRequestId);
        if (c.getRecvType() == RecvType.지정의사 && !doctorId.equals(c.getRecvDoctorId())) {
            throw new RuntimeException("본인에게 온 협진 요청만 수락할 수 있습니다.");
        }
        if (c.getRecvType() == RecvType.진료과 && !c.getRecvDeptId().equals(viewerDeptId)) {
            throw new RuntimeException("해당 진료과 소속 의사만 수락할 수 있습니다.");
        }

        int updated = coopRequestRepository.acceptIfPending(coopRequestId, doctorId);
        if (updated == 0) {
            throw new RuntimeException("이미 처리된 요청입니다.");
        }
        return updated;
    }

    @Override
    @Transactional
    public int reject(Long coopRequestId, Long doctorId, String rejectReason) {
        CoopRequest c = findEntity(coopRequestId);
        if (c.getRecvType() != RecvType.지정의사) {
            throw new RuntimeException("진료과 요청은 개인별 거절(deptReject)을 이용해야 합니다.");
        }
        if (!doctorId.equals(c.getRecvDoctorId())) {
            throw new RuntimeException("본인에게 온 협진 요청만 거절할 수 있습니다.");
        }
        if (rejectReason == null || rejectReason.isBlank()) {
            throw new RuntimeException("거절 사유를 입력해야 합니다.");
        }

        int updated = coopRequestRepository.rejectIfPending(coopRequestId, rejectReason);
        if (updated == 0) {
            throw new RuntimeException("이미 처리된 요청입니다.");
        }
        return updated;
    }

    @Override
    @Transactional
    public int deptReject(Long coopRequestId, Long doctorId, Long viewerDeptId, String rejectReason) {
        CoopRequest c = findEntity(coopRequestId);
        if (c.getRecvType() != RecvType.진료과) {
            throw new RuntimeException("지정의사 요청은 reject를 이용해야 합니다.");
        }
        if (!c.getRecvDeptId().equals(viewerDeptId)) {
            throw new RuntimeException("해당 진료과 소속 의사만 거절할 수 있습니다.");
        }
        if (c.getStatus() != CoopStatus.요청) {
            throw new RuntimeException("이미 처리된 요청입니다.");
        }
        if (rejectReason == null || rejectReason.isBlank()) {
            throw new RuntimeException("거절 사유를 입력해야 합니다.");
        }
        if (deptRejectRepository.existsByCoopRequestIdAndDoctorId(coopRequestId, doctorId)) {
            throw new RuntimeException("이미 거절 처리하셨습니다.");
        }

        deptRejectRepository.save(CoopRequestDeptReject.builder()
                .coopRequestId(coopRequestId)
                .doctorId(doctorId)
                .rejectReason(rejectReason)
                .build());

        long rejectedCount = deptRejectRepository.countByCoopRequestId(coopRequestId);
        long totalDoctors = resolveDeptDoctorCount(viewerDeptId);

        if (totalDoctors > 0 && rejectedCount >= totalDoctors) {
            // 전원 거절 확정 - 이미 수락되어 있었다면(레이스에서 패배) 조건부 UPDATE가 0을 반환하며 조용히 무시됨
            coopRequestRepository.confirmDeptRejectIfPending(coopRequestId);
        }
        return 1;
    }

    @Override
    @Transactional
    public int cancel(Long coopRequestId, Long doctorId) {
        CoopRequest c = findEntity(coopRequestId);
        if (!doctorId.equals(c.getReqDoctorId())) {
            throw new RuntimeException("본인이 요청한 협진만 취소할 수 있습니다.");
        }

        int updated = coopRequestRepository.cancelIfPending(coopRequestId);
        if (updated == 0) {
            throw new RuntimeException("취소할 수 없는 상태입니다. (이미 처리되었거나 진행 중인 요청)");
        }
        return updated;
    }

    @Override
    public UnreadCountVO unreadCount(Long doctorId, Long deptId) {
        long count = coopRequestRepository.countUnread(doctorId, deptId, PENDING_STATUSES);
        return new UnreadCountVO(count);
    }

    @Override
    public List<CoopRequestVO> adminList(Long reqDoctorId, Long recvDoctorId, Long deptId, PageObject pageObject,
                                         List<String> statuses, LocalDate from, LocalDate to) {
        // 관리자 화면은 기본값으로 취소 포함 전체 상태를 다 보여준다 (감사/조회 목적이라 숨길 이유가 없음)
        List<CoopStatus> statusList = resolveStatuses(statuses, List.of(CoopStatus.values()));

        // 수신자 필터로 넘어온 의사의 소속과도 같이 조회해둔다 - 아직 아무도 수락 안 한
        // 진료과 요청은 recv_doctor_id/accept_doctor_id가 둘 다 비어있어서, 소속과 기준으로도
        // 같이 매칭해줘야 "이 의사한테 갈 수도 있었던 요청"이 검색에서 안 빠진다.
        Long recvDoctorDeptId = null;
        if (recvDoctorId != null) {
            recvDoctorDeptId = memberRepository.findById(recvDoctorId)
                    .map(m -> m.getDepartment() != null ? m.getDepartment().getNo() : null)
                    .orElse(null);
        }

        long total = coopRequestRepository.findAllForAdminCount(reqDoctorId, recvDoctorId, recvDoctorDeptId, deptId, statusList, from, to);
        pageObject.setTotalRow(total);

        List<CoopRequest> list = coopRequestRepository.findAllForAdmin(
                reqDoctorId, recvDoctorId, recvDoctorDeptId, deptId, statusList, from, to,
                pageObject.getLimit(), pageObject.getPerPageNum());

        // 화면(행마다 DB를 따로 왕복하던 N+1 문제 해결)에 필요한 의사/진료과 이름을
        // 이 페이지 분량 전체에 걸쳐 한 번씩만 모아서 배치로 가져온다.
        // 환자/검사 정보는 관리자 목록 화면에 아예 표시하지 않으므로 조회 자체를 생략한다
        // (원래 toVO()를 그대로 썼을 때는 행마다 필요 없는 그 조회까지 매번 하고 있었다).
        Set<Long> doctorIds = new HashSet<>();
        Set<Long> deptIds = new HashSet<>();
        for (CoopRequest c : list) {
            doctorIds.add(c.getReqDoctorId());
            if (c.getRecvDoctorId() != null) doctorIds.add(c.getRecvDoctorId());
            if (c.getAcceptDoctorId() != null) doctorIds.add(c.getAcceptDoctorId());
            if (c.getRecvDeptId() != null) deptIds.add(c.getRecvDeptId());
        }
        Map<Long, Member> memberMap = doctorIds.isEmpty()
                ? Map.of()
                : memberRepository.findAllByIdWithDepartment(doctorIds).stream()
                .collect(Collectors.toMap(Member::getNo, m -> m));
        Map<Long, String> deptNameMap = deptIds.isEmpty()
                ? Map.of()
                : departmentRepository.findAllById(deptIds).stream()
                .collect(Collectors.toMap(d -> d.getNo(), d -> d.getDepartmentName()));

        List<CoopRequestVO> result = new ArrayList<>();
        for (CoopRequest c : list) {
            CoopRequestVO vo = new CoopRequestVO();
            vo.setCoopRequestId(c.getCoopRequestId());
            vo.setReqDoctorId(c.getReqDoctorId());
            vo.setRecvType(c.getRecvType().name());
            vo.setRecvDoctorId(c.getRecvDoctorId());
            vo.setRecvDeptId(c.getRecvDeptId());
            vo.setAcceptDoctorId(c.getAcceptDoctorId());
            vo.setPacsStudyId(c.getPacsStudyId());
            vo.setReqContent(c.getReqContent());
            vo.setStatus(c.getStatus().name());
            vo.setDisplayStatus(c.getStatus().name());
            vo.setCanRespond(false);
            vo.setReqTime(c.getReqTime() == null ? null : c.getReqTime().format(DATETIME_FMT));
            vo.setRespTime(c.getRespTime() == null ? null : c.getRespTime().format(DATETIME_FMT));
            vo.setRejectReason(c.getRejectReason());

            applyNameFromMap(memberMap.get(c.getReqDoctorId()), vo::setReqDoctorName, vo::setReqDoctorMeta);
            if (c.getRecvDoctorId() != null) {
                applyNameFromMap(memberMap.get(c.getRecvDoctorId()), vo::setRecvDoctorName, vo::setRecvDoctorMeta);
            }
            if (c.getAcceptDoctorId() != null) {
                applyNameFromMap(memberMap.get(c.getAcceptDoctorId()), vo::setAcceptDoctorName, vo::setAcceptDoctorMeta);
            }
            if (c.getRecvDeptId() != null) {
                vo.setRecvDeptName(deptNameMap.get(c.getRecvDeptId()));
            }

            result.add(vo);
        }
        return result;
    }

    /** memberMap에서 이미 조회해둔 Member로 이름+메타를 채운다 (DB 재조회 없음) */
    private void applyNameFromMap(Member m, java.util.function.Consumer<String> nameSetter,
                                  java.util.function.Consumer<String> metaSetter) {
        if (m == null) {
            return;
        }
        nameSetter.accept(m.getName());
        List<String> metaParts = new ArrayList<>();
        if (m.getDepartment() != null && m.getDepartment().getDepartmentName() != null) {
            metaParts.add(m.getDepartment().getDepartmentName());
        }
        if (m.getSpecialty() != null && !m.getSpecialty().isBlank()) {
            metaParts.add(m.getSpecialty());
        }
        if (m.getPosition() != null && !m.getPosition().isBlank()) {
            metaParts.add(m.getPosition());
        }
        metaSetter.accept(String.join(" · ", metaParts));
    }

    // ------------------------------------------------------------------
    // 내부 헬퍼
    // ------------------------------------------------------------------

    private CoopRequest findEntity(Long coopRequestId) {
        return coopRequestRepository.findById(coopRequestId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 협진요청입니다."));
    }

    private List<CoopStatus> resolveStatuses(List<String> statuses, List<CoopStatus> defaultValue) {
        if (statuses == null || statuses.isEmpty()) {
            return defaultValue;
        }
        List<CoopStatus> result = new ArrayList<>();
        for (String s : statuses) {
            result.add(CoopStatus.valueOf(s));
        }
        return result;
    }

    /**
     * 진료과 요청에서 "이 조회자가 본 화면 기준 상태"를 계산한다 (DB에는 저장하지 않음).
     * - 본인이 수락자면 "수락"
     * - 본인이 거절했으면 "거절" (전체 상태와 무관하게 본인 화면에는 이렇게 보임)
     * - 그 외에 이미 다른 의사가 수락해버렸으면 "종료" (기회를 놓친 것)
     * - 그 외에는 실제 status 그대로
     *
     * viewerDeptId: canRespond를 계산할 때 "이 사람이 실제로 그 진료과 소속인지"까지 확인한다.
     * 목록 조회(받은 협진함 등)는 애초에 소속과 맞는 사람한테만 그 row가 보여서 문제가 없었지만,
     * view.do?no=는 번호만 알면 누구나(다른 과 의사, 진료과 없는 관리자 등) 접근 가능해서
     * 이 체크가 없으면 소속과 무관하게 수락/거절 버튼이 잘못 뜰 수 있었다.
     */
    private void applyDisplayStatus(CoopRequestVO vo, CoopRequest c, Long viewerDoctorId, Long viewerDeptId) {
        if (c.getRecvType() == RecvType.지정의사) {
            vo.setDisplayStatus(c.getStatus().name());
            vo.setCanRespond(c.getStatus() == CoopStatus.요청 && viewerDoctorId.equals(c.getRecvDoctorId()));
            return;
        }

        if (viewerDoctorId.equals(c.getAcceptDoctorId())) {
            vo.setDisplayStatus("수락");
            vo.setCanRespond(false);
            return;
        }
        boolean viewerRejected = deptRejectRepository.existsByCoopRequestIdAndDoctorId(c.getCoopRequestId(), viewerDoctorId);
        if (viewerRejected) {
            vo.setDisplayStatus("거절");
            vo.setCanRespond(false);
            // 전원 거절 확정 전엔 c.getRejectReason()이 비어있어서, 본인이 쓴 사유를 따로 채워준다.
            deptRejectRepository.findByCoopRequestIdAndDoctorId(c.getCoopRequestId(), viewerDoctorId)
                    .ifPresent(r -> vo.setViewerRejectReason(r.getRejectReason()));
            return;
        }
        if (c.getStatus() == CoopStatus.수락) {
            vo.setDisplayStatus("종료");
            vo.setCanRespond(false);
            return;
        }
        boolean isDeptMember = viewerDeptId != null && viewerDeptId.equals(c.getRecvDeptId());
        vo.setDisplayStatus(c.getStatus().name());
        vo.setCanRespond(c.getStatus() == CoopStatus.요청 && isDeptMember);
    }

    private long resolveDeptDoctorCount(Long deptId) {
        return memberRepository.countByDepartment_NoAndStatus(deptId, "ACTIVE");
    }

    private CoopRequestVO toVO(CoopRequest c, Long viewerId) {
        CoopRequestVO vo = new CoopRequestVO();
        vo.setCoopRequestId(c.getCoopRequestId());
        vo.setReqDoctorId(c.getReqDoctorId());
        vo.setRecvType(c.getRecvType().name());
        vo.setRecvDoctorId(c.getRecvDoctorId());
        vo.setRecvDeptId(c.getRecvDeptId());
        vo.setAcceptDoctorId(c.getAcceptDoctorId());
        vo.setPacsStudyId(c.getPacsStudyId());
        vo.setReportId(c.getReportId());
        vo.setOriginRequestId(c.getOriginRequestId());
        vo.setReqContent(c.getReqContent());
        vo.setStatus(c.getStatus().name());
        vo.setReqTime(c.getReqTime() == null ? null : c.getReqTime().format(DATETIME_FMT));
        vo.setRespTime(c.getRespTime() == null ? null : c.getRespTime().format(DATETIME_FMT));
        vo.setRejectReason(c.getRejectReason());

        // 검사 설명 + 촬영일 + 환자 정보 (PacsStudy 조회 한 번으로 전부 해결)
        // patient_id 컬럼을 없애면서, 환자는 이제 pacs_study -> patient(FK) 통해서만 얻는다.
        pacsStudyRepository.findById(c.getPacsStudyId())
                .ifPresent(s -> {
                    String label = s.getStudyDescription();
                    if (s.getStudyDate() != null && !s.getStudyDate().isBlank()) {
                        label = (label == null ? "" : label + " ") + formatStudyDate(s.getStudyDate());
                    }
                    vo.setPacsStudyLabel(label);

                    if (s.getPatient() != null) {
                        vo.setPatientId(s.getPatient().getNo());
                        vo.setPatientName(s.getPatient().getPatientName());
                    }
                });

        // 요청자/수신자/수락자 이름은 조회자가 누구든 항상 실제 이름을 보여준다 ("나"로 치환하지 않음).
        applyRealDoctorName(c.getReqDoctorId(), vo::setReqDoctorName, vo::setReqDoctorMeta);
        if (c.getRecvDoctorId() != null) {
            applyRealDoctorName(c.getRecvDoctorId(), vo::setRecvDoctorName, vo::setRecvDoctorMeta);
        }
        if (c.getAcceptDoctorId() != null) {
            applyRealDoctorName(c.getAcceptDoctorId(), vo::setAcceptDoctorName, vo::setAcceptDoctorMeta);
        }
        // "조회자가 수락한 그 의사 본인인지"는 이름과 별개로 항상 계산해둔다 (채팅 버튼 노출 등에 사용).
        vo.setViewerIsAcceptDoctor(c.getAcceptDoctorId() != null && c.getAcceptDoctorId().equals(viewerId));
        if (c.getRecvDeptId() != null) {
            departmentRepository.findById(c.getRecvDeptId())
                    .ifPresent(d -> vo.setRecvDeptName(d.getDepartmentName()));
        }

        return vo;
    }

    /** 요청자/수신자/수락자 이름 - 조회자와 무관하게 항상 실제 이름+메타를 채운다. */
    private void applyRealDoctorName(Long doctorId,
                                     java.util.function.Consumer<String> nameSetter,
                                     java.util.function.Consumer<String> metaSetter) {
        memberRepository.findById(doctorId).ifPresent(m -> {
            nameSetter.accept(m.getName());
            List<String> metaParts = new ArrayList<>();
            if (m.getDepartment() != null && m.getDepartment().getDepartmentName() != null) {
                metaParts.add(m.getDepartment().getDepartmentName());
            }
            if (m.getSpecialty() != null && !m.getSpecialty().isBlank()) {
                metaParts.add(m.getSpecialty());
            }
            if (m.getPosition() != null && !m.getPosition().isBlank()) {
                metaParts.add(m.getPosition());
            }
            metaSetter.accept(String.join(" · ", metaParts));
        });
    }

    /** pacs_study.study_date는 "20260810" 형태(DICOM 날짜)라 화면용으로 "2026-08-10"로 바꿔준다. */
    private String formatStudyDate(String rawDate) {
        if (rawDate == null || rawDate.length() != 8) {
            return rawDate;
        }
        return rawDate.substring(0, 4) + "-" + rawDate.substring(4, 6) + "-" + rawDate.substring(6, 8);
    }
}