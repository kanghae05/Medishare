package com.medishare.api.notice.dto;

import com.medishare.api.notice.entity.Notice;

import java.time.LocalDateTime;

/** 공지사항 API 요청과 응답 형식을 모아 둔 DTO 클래스. */
public final class NoticeDto {

    private NoticeDto() {
    }

    /** 공지사항 목록 및 상세 조회 응답 데이터. */
    public record Response(
            Long noticeId,
            Long writerId,
            String title,
            String content,
            boolean pinned,
            int views,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static Response from(Notice notice) {
            return new Response(
                    notice.getId(),
                    notice.getWriterId(),
                    notice.getTitle(),
                    notice.getContent(),
                    notice.isPinned(),
                    notice.getViews(),
                    notice.getCreatedAt(),
                    notice.getUpdatedAt()
            );
        }
    }
}
