package com.medishare.api.notice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/** 공지사항의 제목, 본문, 고정 여부와 조회 정보를 저장하는 Entity. */
@Entity
@Table(name = "notices")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long id;

    // 회원 Entity와 직접 연관관계를 맺지 않고 회원 PK만 저장한다.
    @Column(name = "writer_id", nullable = false)
    private Long writerId;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(name = "is_pinned", nullable = false)
    private boolean pinned;

    @Column(nullable = false)
    private int views;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 물리 삭제 대신 이 값을 true로 변경하여 목록에서 제외한다.
    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    public Notice(Long writerId, String title, String content, boolean pinned) {
        this.writerId = writerId;
        update(title, content, pinned);
    }

    public void update(String title, String content, boolean pinned) {
        this.title = requireText(title, "title");
        this.content = requireText(content, "content");
        this.pinned = pinned;
    }

    public void increaseViews() {
        views++;
    }

    public void delete() {
        deleted = true;
    }

    private static String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }

        return value.trim();
    }
}
