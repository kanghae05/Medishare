package com.medishare.api.specialcase.controller;

import com.medishare.api.specialcase.dto.SpecialCaseDto;
import com.medishare.api.specialcase.service.SpecialCaseService;
import com.medishare.api.specialcase.vo.SpecialCaseVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * 특이케이스 라이브러리 REST API를 제공하는 Controller.
 * 실제 업무 로직은 {@link SpecialCaseService}에 위임한다.
 */
@RestController
@RequestMapping("/api/special-cases")
@RequiredArgsConstructor
public class SpecialCaseController {

    // Lombok의 @RequiredArgsConstructor가 생성자를 만들어 자동으로 DI한다.
    private final SpecialCaseService specialCaseService;

    /** 검색 조건과 정렬 기준을 적용하여 특이케이스 목록을 조회한다. */
    @GetMapping
    public Page<SpecialCaseDto.Response> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(required = false) String modality,
            @RequestParam(required = false) String bodyPart,
            @RequestParam(required = false) String keyword
    ) {
        return specialCaseService.list(page, size, sort, modality, bodyPart, keyword);
    }

    /** 특이케이스 한 건을 조회하고 조회수를 증가시킨다. */
    @GetMapping("/{id}")
    public SpecialCaseDto.Response detail(@PathVariable Long id) {
        return specialCaseService.detail(id);
    }

    /** 특이케이스에 연결된 Orthanc Study의 대표 이미지를 반환한다. */
    @GetMapping(value = "/{id}/preview", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> preview(@PathVariable Long id) {
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(specialCaseService.preview(id));
    }

    /** 로그인 사용자를 작성자로 지정하여 특이케이스를 등록한다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SpecialCaseDto.Response create(
            Authentication authentication,
            @RequestBody SpecialCaseVO vo
    ) {
        return specialCaseService.create(getActorId(authentication), vo);
    }

    /** 작성자 본인의 특이케이스를 수정한다. */
    @PutMapping("/{id}")
    public SpecialCaseDto.Response update(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody SpecialCaseVO vo
    ) {
        return specialCaseService.update(id, getActorId(authentication), vo);
    }

    /** 작성자 본인 또는 관리자의 요청으로 특이케이스를 Soft Delete 처리한다. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        specialCaseService.delete(id, getActorId(authentication), isAdmin(authentication));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    /**
     * 인증 객체에서 숫자형 회원 PK를 추출한다.
     * 현재 회원 Principal과의 직접 의존을 피하기 위해 getId()를 동적으로 호출한다.
     */
    private long getActorId(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();

        try {
            // 로그인 문자열 ID가 아니라 작성자 FK로 사용할 숫자 회원 PK를 가져온다.
            Object id = principal.getClass().getMethod("getNo").invoke(principal);

            if (id instanceof Number number) {
                return number.longValue();
            }

            return Long.parseLong(String.valueOf(id));
        } catch (ReflectiveOperationException | NumberFormatException ignored) {
            return parseAuthenticationName(authentication);
        }
    }

    private long parseAuthenticationName(Authentication authentication) {
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated principal has no numeric user id"
            );
        }
    }
}
