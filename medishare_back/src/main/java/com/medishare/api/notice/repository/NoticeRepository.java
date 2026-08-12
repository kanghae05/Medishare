package com.medishare.api.notice.repository;

import com.medishare.api.notice.entity.Notice;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

/** 공지사항 DB 조회를 담당하는 Spring Data JPA Repository. */
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // 삭제되지 않은 공지 중 제목에 키워드가 포함된 데이터만 조회한다.
    Page<Notice> findByDeletedFalseAndTitleContainingIgnoreCase(String keyword, Pageable pageable);
}
