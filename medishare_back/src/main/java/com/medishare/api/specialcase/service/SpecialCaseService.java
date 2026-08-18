package com.medishare.api.specialcase.service;

import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.specialcase.dto.SpecialCaseDto;
import com.medishare.api.specialcase.entity.CasePacsLink;
import com.medishare.api.specialcase.entity.SpecialCase;
import com.medishare.api.specialcase.repository.SpecialCaseRepository;
import com.medishare.api.specialcase.util.DeidentificationUtil;
import com.medishare.api.specialcase.vo.SpecialCaseVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

/** 특이케이스 조회, 등록, 수정, 삭제 업무 로직을 담당한다. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpecialCaseService {

    private static final int MAX_PAGE_SIZE = 100;

    private final SpecialCaseRepository specialCaseRepository;
    private final QMemberRepository memberRepository;

    /** 필터, 키워드, 정렬 기준을 적용한 페이지 목록을 반환한다. */
    public Page<SpecialCaseDto.Response> list(
            int page,
            int size,
            String sort,
            String modality,
            String bodyPart,
            String keyword
    ) {
        String sortField = "views".equals(sort) ? "views" : "createdAt";
        Pageable pageable = createPageable(page, size, sortField);

        return specialCaseRepository.search(
                emptyToNull(modality),
                emptyToNull(bodyPart),
                emptyToNull(keyword),
                pageable
        ).map(this::toResponse);
    }

    /** 활성 케이스를 조회하고 조회수를 1 증가시킨다. */
    @Transactional
    public SpecialCaseDto.Response detail(Long id) {
        SpecialCase specialCase = findActiveCase(id);
        specialCase.increaseViews();

        return toResponse(specialCase);
    }

    /** 개인정보를 비식별화한 뒤 케이스, PACS 링크, 태그를 함께 저장한다. */
    @Transactional
    public SpecialCaseDto.Response create(Long writerId, SpecialCaseVO vo) {
        String safeFindings = DeidentificationUtil.scrub(vo.getFindings(), vo.getPatientName());
        String safeImpression = DeidentificationUtil.scrub(vo.getImpression(), vo.getPatientName());

        SpecialCase specialCase = new SpecialCase(writerId, vo, safeFindings, safeImpression);
        replacePacsLinkAndTags(specialCase, vo);

        SpecialCase savedCase = specialCaseRepository.save(specialCase);
        return toResponse(savedCase);
    }

    /** 작성자를 확인한 뒤 본문, PACS 링크, 태그를 갱신한다. */
    @Transactional
    public SpecialCaseDto.Response update(
            Long id,
            Long actorId,
            SpecialCaseVO vo
    ) {
        SpecialCase specialCase = findActiveCase(id);
        validateOwner(specialCase, actorId);

        String safeFindings = DeidentificationUtil.scrub(vo.getFindings(), vo.getPatientName());
        String safeImpression = DeidentificationUtil.scrub(vo.getImpression(), vo.getPatientName());

        specialCase.update(vo, safeFindings, safeImpression);
        replacePacsLinkAndTags(specialCase, vo);

        return toResponse(specialCase);
    }

    /** 실제 행을 삭제하지 않고 is_deleted 값만 변경한다. */
    @Transactional
    public void delete(Long id, Long actorId) {
        SpecialCase specialCase = findActiveCase(id);
        validateOwner(specialCase, actorId);
        specialCase.delete();
    }

    private Pageable createPageable(int page, int size, String sortField) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        return PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, sortField)
        );
    }

    private void replacePacsLinkAndTags(
            SpecialCase specialCase,
            SpecialCaseVO vo
    ) {
        if (vo.getStudyInstanceUid() == null || vo.getStudyInstanceUid().isBlank()) {
            throw new IllegalArgumentException("studyInstanceUid is required");
        }

        CasePacsLink pacsLink = new CasePacsLink(
                specialCase,
                vo.getStudyInstanceUid().trim(),
                emptyToNull(vo.getSeriesInstanceUid()),
                DeidentificationUtil.hashPatientId(vo.getPatientId())
        );

        specialCase.replacePacsLink(pacsLink);
        specialCase.replaceTags(vo.getTags() == null ? List.of() : vo.getTags());
    }

    private SpecialCase findActiveCase(Long id) {
        return specialCaseRepository.findActiveDetail(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Special case not found"
                ));
    }

    private void validateOwner(SpecialCase specialCase, Long actorId) {
        if (!Objects.equals(specialCase.getWriterId(), actorId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the writer can modify this case"
            );
        }
    }

    /** 회원 PK로 작성자 이름을 조회해 API 응답에 포함한다. */
    private SpecialCaseDto.Response toResponse(SpecialCase specialCase) {
        String writerName = memberRepository.findById(specialCase.getWriterId())
                .map(member -> member.getName())
                .orElse("알 수 없는 사용자");

        return SpecialCaseDto.Response.from(specialCase, writerName);
    }

    /** 빈 검색 조건을 null로 통일하여 Repository의 동적 조건을 비활성화한다. */
    private static String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
