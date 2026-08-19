package com.medishare.api.specialcase.repository;

import com.medishare.api.specialcase.entity.SpecialCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/** 특이케이스 DB 조회를 담당하는 Spring Data JPA Repository. */
public interface SpecialCaseRepository extends JpaRepository<SpecialCase, Long> {

    /**
     * 삭제되지 않은 케이스를 대상으로 필터와 키워드 검색을 수행한다.
     * 키워드는 제목, 판독 소견, 태그명 중 하나와 일치하면 조회된다.
     */
    @Query(
            value = """
                    select distinct c
                    from SpecialCase c
                    left join c.tags t
                    where c.deleted = false
                      and (:modality is null or c.modality = :modality)
                      and (:bodyPart is null or c.bodyPart = :bodyPart)
                      and (
                            :keyword is null
                            or lower(c.title) like lower(concat('%', :keyword, '%'))
                            or lower(c.findings) like lower(concat('%', :keyword, '%'))
                            or lower(t.name) like lower(concat('%', :keyword, '%'))
                      )
                    """,
            countQuery = """
                    select count(distinct c.id)
                    from SpecialCase c
                    left join c.tags t
                    where c.deleted = false
                      and (:modality is null or c.modality = :modality)
                      and (:bodyPart is null or c.bodyPart = :bodyPart)
                      and (
                            :keyword is null
                            or lower(c.title) like lower(concat('%', :keyword, '%'))
                            or lower(c.findings) like lower(concat('%', :keyword, '%'))
                            or lower(t.name) like lower(concat('%', :keyword, '%'))
                      )
                    """
    )
    Page<SpecialCase> search(
            @Param("modality") String modality,
            @Param("bodyPart") String bodyPart,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /** 상세 응답에 필요한 PACS 링크와 태그를 한 번에 가져온다. */
    @EntityGraph(attributePaths = {"pacsLink", "tags"})
    @Query("select c from SpecialCase c where c.id = :id and c.deleted = false")
    Optional<SpecialCase> findActiveDetail(@Param("id") Long id);

    /** 동일 PACS Study로 이미 등록된 활성 특이케이스가 있는지 확인한다. */
    @Query("""
            select case when count(c) > 0 then true else false end
            from SpecialCase c
            join c.pacsLink p
            where c.deleted = false and p.studyInstanceUid = :studyInstanceUid
            """)
    boolean existsActiveByStudyInstanceUid(@Param("studyInstanceUid") String studyInstanceUid);
}
