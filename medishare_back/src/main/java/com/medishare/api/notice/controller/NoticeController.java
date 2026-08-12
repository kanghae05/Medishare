package com.medishare.api.notice.controller;

import com.medishare.api.notice.dto.NoticeDto;
import com.medishare.api.notice.service.NoticeService;
import com.medishare.api.notice.vo.NoticeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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

/** 공지사항 목록, 상세, 등록, 수정, 삭제 API를 제공한다. */
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    /** 고정 공지를 우선하여 제목 검색 결과를 페이지로 반환한다. */
    @GetMapping
    public Page<NoticeDto.Response> list(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return noticeService.list(keyword, page, size);
    }

    /** 공지사항 한 건을 조회하고 조회수를 증가시킨다. */
    @GetMapping("/{id}")
    public NoticeDto.Response detail(@PathVariable Long id) {
        return noticeService.detail(id);
    }

    /** 관리자만 새 공지사항을 등록할 수 있다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public NoticeDto.Response create(
            Authentication authentication,
            @RequestBody NoticeVO vo
    ) {
        return noticeService.create(getActorId(authentication), vo);
    }

    /** 관리자만 공지사항을 수정할 수 있다. */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public NoticeDto.Response update(
            @PathVariable Long id,
            @RequestBody NoticeVO vo
    ) {
        return noticeService.update(id, vo);
    }

    /** 관리자만 공지사항을 Soft Delete 처리할 수 있다. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        noticeService.delete(id);
    }

    /** 인증 Principal에서 작성자 회원 PK를 추출한다. */
    private long getActorId(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        Object principal = authentication.getPrincipal();

        try {
            Object id = principal.getClass().getMethod("getId").invoke(principal);

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
