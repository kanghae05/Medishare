package com.medishare.api.coop.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 선택한 검사에 소견서가 있는지 확인할 때(첨부 후보), 또는 상세화면에 첨부된 소견서를 보여줄 때 사용 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportLookupVO {
    private Long no;
    private String title;
    private String status; // DRAFT 또는 FINAL
    // 아래 둘은 상세화면에서 첨부 소견서 "내용"까지 보여줄 때만 채운다.
    // 첨부 후보 목록(등록 폼)에서는 제목/상태만 필요해서 null로 둔다.
    private String findings;
    private String impression;
}