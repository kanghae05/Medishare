package com.medishare.api.coop.controller;

import com.medishare.api.coop.entity.PacsStudyRef;
import com.medishare.api.coop.repository.PacsStudyRefRepository;
import com.medishare.api.coop.service.CoopRequestService;
import com.medishare.api.coop.service.OrthancImageService;
import com.medishare.api.coop.vo.CoopRequestVO;
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
    private final PacsStudyRefRepository pacsStudyRefRepository;
    private final OrthancImageService orthancImageService;

    // ------------------------------------------------------------------
    // 로그인 사용자 정보 추출
    // TODO(3번 회원관리 연동): 실제 Security 인증 principal이 완성되면 아래 두 메서드를
    // MemberUserDetails(가칭)에서 doctorId / deptId를 꺼내오는 코드로 교체한다.
    // 예: return ((MemberUserDetails) authentication.getPrincipal()).getMember().getNo();
    // ------------------------------------------------------------------

    private Long currentDoctorId(Authentication authentication) {
        throw new UnsupportedOperationException("로그인 인증 연동 전까지 미구현 (3번 회원관리 완료 후 교체)");
    }

    private Long currentDeptId(Authentication authentication) {
        throw new UnsupportedOperationException("로그인 인증 연동 전까지 미구현 (3번 회원관리 완료 후 교체)");
    }

    // ------------------------------------------------------------------
    // 조회
    // ------------------------------------------------------------------

    // 받은 협진함 (4-5-1)
    @GetMapping("/received.do")
    public Map<String, Object> received(@RequestParam(required = false) String status,
                                        @RequestParam(defaultValue = "false") boolean unreadOnly,
                                        @RequestParam(required = false) String from,
                                        @RequestParam(required = false) String to,
                                        HttpServletRequest request,
                                        Authentication authentication) throws Exception {
        Long doctorId = currentDoctorId(authentication);
        Long deptId = currentDeptId(authentication);
        PageObject pageObject = PageObject.getInstance(request);

        List<CoopRequestVO> list = coopRequestService.receivedList(
                doctorId, deptId, pageObject,
                parseStatuses(status), unreadOnly, parseDate(from), parseDate(to));

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
        Long deptId = currentDeptId(authentication);
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
        return coopRequestService.view(no, doctorId);
    }

    // 안 읽은 개수 (4-7, 폴링용)
    @GetMapping("/unreadCount.do")
    public UnreadCountVO unreadCount(Authentication authentication) {
        Long doctorId = currentDoctorId(authentication);
        Long deptId = currentDeptId(authentication);
        return coopRequestService.unreadCount(doctorId, deptId);
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
    // 검사 이미지 (Orthanc 프록시)
    // TODO: PACS 담당자가 정식 검사/이미지 조회 API를 만들면 이 두 메서드는 삭제하고
    // 그쪽 API를 호출하도록 바꾼다. (PacsStudyRef, OrthancImageService도 같이 삭제)
    // ------------------------------------------------------------------

    // 이 검사에 이미지가 몇 장 있는지 (프론트 이전/다음, 슬라이더 범위 계산용)
    @GetMapping("/study/{studyNo}/instances.do")
    public Map<String, Object> instanceCount(@PathVariable Long studyNo) {
        String orthancStudyId = resolveOrthancStudyId(studyNo);
        List<String> instanceIds = orthancImageService.listInstanceIds(orthancStudyId);
        return Map.of("count", instanceIds.size());
    }

    // index번째(0부터 시작) 이미지를 PNG로 반환
    @GetMapping("/study/{studyNo}/instance/{index}/preview.do")
    public ResponseEntity<byte[]> instancePreview(@PathVariable Long studyNo, @PathVariable int index) {
        String orthancStudyId = resolveOrthancStudyId(studyNo);
        List<String> instanceIds = orthancImageService.listInstanceIds(orthancStudyId);

        if (index < 0 || index >= instanceIds.size()) {
            throw new RuntimeException("해당 순번의 이미지가 존재하지 않습니다.");
        }

        byte[] image = orthancImageService.fetchPreview(instanceIds.get(index));
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(image);
    }

    private String resolveOrthancStudyId(Long studyNo) {
        PacsStudyRef study = pacsStudyRefRepository.findById(studyNo)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 검사입니다."));
        return study.getOrthancStudyId();
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