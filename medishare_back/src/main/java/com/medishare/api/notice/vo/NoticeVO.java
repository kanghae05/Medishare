package com.medishare.api.notice.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 공지사항 등록/수정 요청 값을 Controller에서 전달받는 VO.
 * JSON의 title, content, pinned 값이 각 필드에 자동으로 바인딩된다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeVO {

    private String title;

    private String content;

    private boolean pinned;
}
