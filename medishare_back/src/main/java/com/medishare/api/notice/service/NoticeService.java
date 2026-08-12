package com.medishare.api.notice.service;

import com.medishare.api.notice.dto.NoticeDto;
import com.medishare.api.notice.entity.Notice;
import com.medishare.api.notice.repository.NoticeRepository;
import com.medishare.api.notice.vo.NoticeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** 공지사항의 조회, 등록, 수정, 삭제 업무 로직을 담당한다. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private static final int MAX_PAGE_SIZE = 100;

    private final NoticeRepository noticeRepository;

    /** 고정 여부 내림차순, 작성일 내림차순으로 공지 목록을 조회한다. */
    public Page<NoticeDto.Response> list(String keyword, int page, int size) {
        Pageable pageable = createPageable(page, size);
        String safeKeyword = keyword == null ? "" : keyword.trim();

        return noticeRepository
                .findByDeletedFalseAndTitleContainingIgnoreCase(safeKeyword, pageable)
                .map(NoticeDto.Response::from);
    }

    /** 활성 공지를 조회하고 조회수를 1 증가시킨다. */
    @Transactional
    public NoticeDto.Response detail(Long id) {
        Notice notice = findActiveNotice(id);
        notice.increaseViews();

        return NoticeDto.Response.from(notice);
    }

    /** 새 공지사항을 저장한다. */
    @Transactional
    public NoticeDto.Response create(Long writerId, NoticeVO vo) {
        Notice notice = new Notice(
                writerId,
                vo.getTitle(),
                vo.getContent(),
                vo.isPinned()
        );

        return NoticeDto.Response.from(noticeRepository.save(notice));
    }

    /** 기존 공지사항의 제목, 내용, 고정 여부를 갱신한다. */
    @Transactional
    public NoticeDto.Response update(Long id, NoticeVO vo) {
        Notice notice = findActiveNotice(id);
        notice.update(vo.getTitle(), vo.getContent(), vo.isPinned());

        return NoticeDto.Response.from(notice);
    }

    /** 실제 행을 삭제하지 않고 삭제 상태로 변경한다. */
    @Transactional
    public void delete(Long id) {
        findActiveNotice(id).delete();
    }

    private Pageable createPageable(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Sort sort = Sort.by(
                Sort.Order.desc("pinned"),
                Sort.Order.desc("createdAt")
        );

        return PageRequest.of(safePage, safeSize, sort);
    }

    private Notice findActiveNotice(Long id) {
        return noticeRepository.findById(id)
                .filter(notice -> !notice.isDeleted())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notice not found"
                ));
    }
}
