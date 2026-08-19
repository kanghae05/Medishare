package com.medishare.api.coop.controller;

import com.medishare.api.member.entity.Member;
import com.medishare.api.pacs.entity.PacsStudy;
import com.medishare.api.coop.repository.CoopDepartmentLookupRepository;
import com.medishare.api.coop.repository.CoopMemberLookupRepository;
import com.medishare.api.coop.repository.CoopPacsPatientLookupRepository;
import com.medishare.api.coop.repository.CoopPacsSeriesLookupRepository;
import com.medishare.api.coop.repository.CoopPacsStudyLookupRepository;
import com.medishare.api.coop.repository.CoopReportLookupRepository;
import com.medishare.api.coop.service.CoopMessageService;
import com.medishare.api.coop.service.CoopRequestService;
import com.medishare.api.coop.service.OrthancImageService;
import com.medishare.api.coop.vo.CoopMessageVO;
import com.medishare.api.coop.vo.CoopRequestVO;
import com.medishare.api.coop.vo.DepartmentLookupVO;
import com.medishare.api.coop.vo.DoctorLookupVO;
import com.medishare.api.coop.vo.PatientLookupVO;
import com.medishare.api.coop.vo.ReportLookupVO;
import com.medishare.api.coop.vo.StudyDetailVO;
import com.medishare.api.coop.vo.SeriesLookupVO;
import com.medishare.api.coop.vo.StudyLookupVO;
import com.medishare.api.coop.vo.UnreadCountVO;
import com.medishare.api.util.page.PageObject;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/coop")
@RequiredArgsConstructor
public class CoopRequestController {

    private final CoopRequestService coopRequestService;
    private final CoopMessageService coopMessageService;
    private final CoopPacsStudyLookupRepository pacsStudyRepository;
    private final CoopPacsSeriesLookupRepository pacsSeriesRepository;
    private final OrthancImageService orthancImageService;
    private final CoopMemberLookupRepository memberRepository;
    private final CoopDepartmentLookupRepository departmentRepository;
    private final CoopPacsPatientLookupRepository patientRepository;
    private final CoopReportLookupRepository reportRepository;

    // ------------------------------------------------------------------
    // 로그인 사용자 정보 추출
    // ------------------------------------------------------------------

    private Long currentDoctorId(Authentication authentication) {
        Member member = (Member) authentication.getPrincipal();
        return member.getNo();
    }

    private Long currentDeptId(Authentication authentication) {
        Member member = (Member) authentication.getPrincipal();
        if (member.getDepartment() == null) {
            throw new RuntimeException("소속 진료과가 등록되지 않은 계정입니다.");
        }
        return member.getDepartment().getNo();
    }

    // ------------------------------------------------------------------
    // 조회
    // ------------------------------------------------------------------

    // 받은 협진함 (4-5-1)
    @GetMapping("/received.do")
    public Map<String, Object> received(@RequestParam(required = false) String status,
                                         @RequestParam(required = false) String from,
                                         @RequestParam(required = false) String to,
                                         HttpServletRequest request,
                                         Authentication authentication) throws Exception {
        Long doctorId = currentDoctorId(authentication);
        Long deptId = safeCurrentDeptId(authentication);
        PageObject pageObject = PageObject.getInstance(request);

        List<CoopRequestVO> list = coopRequestService.receivedList(
                doctorId, deptId, pageObject,
                parseStatuses(status), parseDate(from), parseDate(to));

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("pageObject", pageObject);
        return result;
    }

    // 보낸 협진함 (4-5-2)
    @GetMapping("/sent.do")
    public Map<String, Object> sent(@RequestParam(required = false) String status,
                                     @RequestParam(required = false) String from,
                                     @RequestParam(required = false) String to,
                                     HttpServletRequest request,
                                     Authentication authentication) throws Exception {
        Long doctorId = currentDoctorId(authentication);
        PageObject pageObject = PageObject.getInstance(request);

        List<CoopRequestVO> list = coopRequestService.sentList(
                doctorId, pageObject, parseStatuses(status), parseDate(from), parseDate(to));

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("pageObject", pageObject);
        return result;
    }

    // 전체 협진 내역 (4-5-3)
    @GetMapping("/all.do")
    public Map<String, Object> all(@RequestParam(required = false) String status,
                                    @RequestParam(required = false) String from,
                                    @RequestParam(required = false) String to,
                                    HttpServletRequest request,
                                    Authentication authentication) throws Exception {
        Long doctorId = currentDoctorId(authentication);
        Long deptId = safeCurrentDeptId(authentication);
        PageObject pageObject = PageObject.getInstance(request);

        List<CoopRequestVO> list = coopRequestService.allList(
                doctorId, deptId, pageObject, parseStatuses(status), parseDate(from), parseDate(to));

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("pageObject", pageObject);
        return result;
    }

    // 상세 조회 (열람 처리 포함, 진료과 요청이면 거절자 목록도 함께 반환)
    @GetMapping("/view.do")
    public CoopRequestVO view(@RequestParam Long no, Authentication authentication) {
        Long doctorId = currentDoctorId(authentication);
        Long deptId = safeCurrentDeptId(authentication);
        // 로그인 시점에 이미 확정된 권한 정보라, DB를 다시 조회할 필요 없이 여기서 바로 확인 가능하다.
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return coopRequestService.view(no, doctorId, deptId, isAdmin);
    }

    // 이 협진요청의 채팅 이력 (WebSocket 연결 전에 처음 한 번 불러오는 용도)
    @GetMapping("/{coopRequestId}/messages.do")
    public List<CoopMessageVO> messages(@PathVariable Long coopRequestId, Authentication authentication) {
        Long doctorId = currentDoctorId(authentication);
        Long deptId = safeCurrentDeptId(authentication);
        if (!coopMessageService.isParticipant(coopRequestId, doctorId, deptId)) {
            throw new RuntimeException("이 협진요청의 채팅에 참여할 수 있는 권한이 없습니다.");
        }
        return coopMessageService.history(coopRequestId, doctorId);
    }

    /** 진료과 미배정 계정도 (그 사람이 당사자인 채팅 자체는) 조회할 수 있도록, deptId 없으면 null로 처리 */
    private Long safeCurrentDeptId(Authentication authentication) {
        try {
            return currentDeptId(authentication);
        } catch (RuntimeException e) {
            return null;
        }
    }

    // 안 읽은 개수 (4-7, 폴링용)
    @GetMapping("/unreadCount.do")
    public UnreadCountVO unreadCount(Authentication authentication) {
        Long doctorId = currentDoctorId(authentication);
        Long deptId = safeCurrentDeptId(authentication);
        return coopRequestService.unreadCount(doctorId, deptId);
    }

    // 관리자 전체 조회 (ROLE_ADMIN 전용 - SecurityConfig에서 /coop/admin/** 로 별도 제한)
    @GetMapping("/admin/all.do")
    public Map<String, Object> adminAll(@RequestParam(required = false) Long reqDoctorId,
                                         @RequestParam(required = false) Long recvDoctorId,
                                         @RequestParam(required = false) Long deptId,
                                         @RequestParam(required = false) String status,
                                         @RequestParam(required = false) String from,
                                         @RequestParam(required = false) String to,
                                         HttpServletRequest request) throws Exception {
        PageObject pageObject = PageObject.getInstance(request);

        List<CoopRequestVO> list = coopRequestService.adminList(
                reqDoctorId, recvDoctorId, deptId, pageObject,
                parseStatuses(status), parseDate(from), parseDate(to));

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("pageObject", pageObject);
        return result;
    }

    // ------------------------------------------------------------------
    // 등록 / 상태 변경
    // ------------------------------------------------------------------

    // 등록 (4-1) / 재요청 (4-1-1, body에 originRequestId 포함)
    @PostMapping("/write.do")
    public CoopRequestVO write(@RequestBody CoopRequestVO vo, Authentication authentication) {
        vo.setReqDoctorId(currentDoctorId(authentication));
        return coopRequestService.write(vo);
    }

    // 수락 (4-2)
    @PostMapping("/accept.do")
    public Map<String, Object> accept(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long no = Long.valueOf(body.get("no").toString());
        Long doctorId = currentDoctorId(authentication);
        Long deptId = currentDeptId(authentication);
        int result = coopRequestService.accept(no, doctorId, deptId);
        return Map.of("result", result == 1 ? "ok" : "fail");
    }

    // 거절 - 지정의사 요청 전용 (4-3)
    @PostMapping("/reject.do")
    public Map<String, Object> reject(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long no = Long.valueOf(body.get("no").toString());
        String rejectReason = (String) body.get("rejectReason");
        Long doctorId = currentDoctorId(authentication);
        int result = coopRequestService.reject(no, doctorId, rejectReason);
        return Map.of("result", result == 1 ? "ok" : "fail");
    }

    // 거절 - 진료과 요청, 개인별 (4-3-1)
    @PostMapping("/deptReject.do")
    public Map<String, Object> deptReject(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long no = Long.valueOf(body.get("no").toString());
        String rejectReason = (String) body.get("rejectReason");
        Long doctorId = currentDoctorId(authentication);
        Long deptId = currentDeptId(authentication);
        int result = coopRequestService.deptReject(no, doctorId, deptId, rejectReason);
        return Map.of("result", result == 1 ? "ok" : "fail");
    }

    // 취소 (4-4)
    @PostMapping("/cancel.do")
    public Map<String, Object> cancel(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long no = Long.valueOf(body.get("no").toString());
        Long doctorId = currentDoctorId(authentication);
        int result = coopRequestService.cancel(no, doctorId);
        return Map.of("result", result == 1 ? "ok" : "fail");
    }

    // ------------------------------------------------------------------
    // 협진 요청 등록 폼용 조회 (받는 의사 자동완성 / 받는 진료과 목록)
    // TODO: 3번 담당자가 정식 회원 검색 API를 만들면 이 두 메서드는 삭제하고
    // 그쪽 API를 호출하도록 바꾼다. (관리자 제외 필터도 그때 함께 반영)
    // ------------------------------------------------------------------

    // 받는 의사 자동완성 - 이름/세부전공/진료과명 중 하나라도 검색어 포함, 본인은 제외
    @GetMapping("/lookup/doctors.do")
    public List<DoctorLookupVO> lookupDoctors(@RequestParam(defaultValue = "") String q,
                                               Authentication authentication) {
        Long myDoctorId = currentDoctorId(authentication);
        List<Long> adminIds = memberRepository.findAdminMemberIds();
        return memberRepository.searchDoctors(q, myDoctorId).stream()
                .filter(m -> !adminIds.contains(m.getNo()))
                .map(m -> new DoctorLookupVO(
                        m.getNo(),
                        m.getName(),
                        m.getDepartment() != null ? m.getDepartment().getDepartmentName() : null,
                        m.getSpecialty(),
                        m.getPosition()
                ))
                .toList();
    }

    // 받는 진료과 전체 목록 (드롭다운용)
    @GetMapping("/lookup/departments.do")
    public List<DepartmentLookupVO> lookupDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> new DepartmentLookupVO(d.getNo(), d.getDepartmentName()))
                .toList();
    }

    // 환자 이름 자동완성
    @GetMapping("/lookup/patients.do")
    public List<PatientLookupVO> lookupPatients(@RequestParam(defaultValue = "") String q) {
        if (q.isBlank()) return List.of();
        return patientRepository.searchByName(q).stream()
                .map(p -> new PatientLookupVO(p.getNo(), p.getPatientName(), p.getPatientSex(), p.getPatientBirthDate()))
                .toList();
    }

    // 선택한 환자의 검사 목록 (최신순)
    @GetMapping("/lookup/patients/{patientNo}/studies.do")
    public List<StudyLookupVO> lookupStudiesByPatient(@PathVariable Long patientNo) {
        return pacsStudyRepository.findByPatient_NoOrderByStudyDateDesc(patientNo).stream()
                .map(s -> new StudyLookupVO(
                        s.getNo(),
                        s.getStudyDescription(),
                        s.getStudyDate(),
                        s.getStudyTime(),
                        s.getInstanceCount(),
                        s.getRequestedProcedureDescription()
                ))
                .toList();
    }

    // 선택한 검사에 "본인이 작성한" 소견서가 있는지 확인 (없으면 빈 목록)
    // 다른 의사가 쓴 소견서는 첨부 후보로 보여주지 않는다 - 본인 작성분만 활용 가능.
    @GetMapping("/lookup/studies/{studyNo}/report.do")
    public List<ReportLookupVO> lookupReportByStudy(@PathVariable Long studyNo, Authentication authentication) {
        Long myDoctorId = currentDoctorId(authentication);
        return reportRepository.findFirstByStudyNoAndMember_NoOrderByWriteDateDesc(studyNo, myDoctorId)
                .map(r -> new ReportLookupVO(r.getNo(), r.getTitle(), r.getStatus()))
                .map(List::of)
                .orElse(List.of());
    }

    // 협진 요청에 첨부된 소견서 요약 (상세화면에 "첨부 소견서: 제목 (상태)" 형태로 보여주는 용도)
    @GetMapping("/report/{reportId}.do")
    public ReportLookupVO reportSummary(@PathVariable Long reportId) {
        return reportRepository.findById(reportId)
                .map(r -> new ReportLookupVO(r.getNo(), r.getTitle(), r.getStatus()))
                .orElseThrow(() -> new RuntimeException("존재하지 않는 소견서입니다."));
    }

    // ------------------------------------------------------------------
    // 검사 이미지 (Orthanc 프록시)
    // TODO: PACS 담당자가 정식 검사/이미지 조회 API를 만들면 이 두 메서드는 삭제하고
    // 그쪽 API를 호출하도록 바꾼다. (CoopPacsStudyLookupRepository, OrthancImageService도 같이 삭제)
    // ------------------------------------------------------------------

    // 협진 상세화면에서 보여줄 환자/검사/시리즈 상세 정보
    @GetMapping("/study/{studyNo}/detail.do")
    public StudyDetailVO studyDetail(@PathVariable Long studyNo) {
        PacsStudy s = pacsStudyRepository.findById(studyNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 검사입니다."));

        StudyDetailVO vo = new StudyDetailVO();
        vo.setStudyNo(s.getNo());
        vo.setAccessionNumber(s.getAccessionNumber());
        vo.setStudyDate(s.getStudyDate());
        vo.setStudyTime(s.getStudyTime());
        vo.setStudyDescription(s.getStudyDescription());
        vo.setReferringPhysicianName(s.getReferringPhysicianName());
        vo.setRequestedProcedureDescription(s.getRequestedProcedureDescription());
        vo.setInstanceCount(s.getInstanceCount());
        vo.setSeriesCount(s.getSeriesCount());
        vo.setOrthancStudyId(s.getOrthancStudyId());
        vo.setStudyInstanceUid(s.getStudyInstanceUID());

        if (s.getPatient() != null) {
            var p = s.getPatient();
            vo.setPatientNo(p.getNo());
            vo.setPatientIdText(p.getPatientId());
            vo.setPatientName(p.getPatientName());
            vo.setPatientSex(p.getPatientSex());
            vo.setAge(calculateAge(p.getPatientBirthDate()));
            vo.setOrthancPatientId(p.getOrthancPatientId());
        }

        if (s.getSeriesList() != null && !s.getSeriesList().isEmpty()) {
            var series = s.getSeriesList().get(0);
            vo.setModality(series.getModality());
            vo.setSeriesDescription(series.getSeriesDescription());
        }

        return vo;
    }

    /** "yyyyMMdd" 형태의 생년월일로 만 나이를 계산한다. 형식이 안 맞으면 null. */
    private Integer calculateAge(String birthDateRaw) {
        if (birthDateRaw == null || birthDateRaw.length() != 8) {
            return null;
        }
        try {
            LocalDate birth = LocalDate.of(
                    Integer.parseInt(birthDateRaw.substring(0, 4)),
                    Integer.parseInt(birthDateRaw.substring(4, 6)),
                    Integer.parseInt(birthDateRaw.substring(6, 8)));
            return java.time.Period.between(birth, LocalDate.now()).getYears();
        } catch (Exception e) {
            return null;
        }
    }

    // 해당 검사에 속한 시리즈 목록 (검사 하나에 시리즈가 여러 개일 수 있다)
    @GetMapping("/study/{studyNo}/series.do")
    public List<SeriesLookupVO> studySeries(@PathVariable Long studyNo) {
        PacsStudy study = pacsStudyRepository.findById(studyNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 검사입니다."));

        if (study.getSeriesList() == null) {
            return List.of();
        }
        return study.getSeriesList().stream()
                .map(s -> new SeriesLookupVO(s.getNo(), s.getModality(), s.getSeriesDescription(), s.getInstanceCount()))
                .toList();
    }

    // 이 시리즈에 이미지가 몇 장 있는지 (프론트 이전/다음, 슬라이더 범위 계산용)
    @GetMapping("/series/{seriesNo}/instances.do")
    public Map<String, Object> seriesInstanceCount(@PathVariable Long seriesNo) {
        String orthancSeriesId = resolveOrthancSeriesId(seriesNo);
        List<String> instanceIds = orthancImageService.listInstanceIdsForSeries(orthancSeriesId);
        return Map.of("count", instanceIds.size());
    }

    // 시리즈 내 index번째(0부터 시작) 이미지를 PNG로 반환
    @GetMapping("/series/{seriesNo}/instance/{index}/preview.do")
    public ResponseEntity<byte[]> seriesInstancePreview(@PathVariable Long seriesNo, @PathVariable int index) {
        String orthancSeriesId = resolveOrthancSeriesId(seriesNo);
        List<String> instanceIds = orthancImageService.listInstanceIdsForSeries(orthancSeriesId);

        if (index < 0 || index >= instanceIds.size()) {
            throw new RuntimeException("해당 순번의 이미지가 존재하지 않습니다.");
        }

        byte[] image = orthancImageService.fetchPreview(instanceIds.get(index));
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(image);
    }

    private String resolveOrthancSeriesId(Long seriesNo) {
        return pacsSeriesRepository.findById(seriesNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 시리즈입니다."))
                .getOrthancSeriesId();
    }

    // ------------------------------------------------------------------
    // 내부 헬퍼
    // ------------------------------------------------------------------

    // status=요청,수락,거절 형태의 콤마구분 문자열을 리스트로 변환 (없으면 null -> Service 기본값 사용)
    private List<String> parseStatuses(String status) {
        if (status == null || status.isBlank()) return null;
        return Arrays.asList(status.split(","));
    }

    private LocalDate parseDate(String date) {
        return (date == null || date.isBlank()) ? null : LocalDate.parse(date);
    }
}
