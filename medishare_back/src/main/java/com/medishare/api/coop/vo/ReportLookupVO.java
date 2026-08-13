package com.medishare.api.coop.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 선택한 검사에 소견서가 있는지, 있다면 첨부할지 물어볼 때 보여줄 정보 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportLookupVO {
    private Long no;
    private String title;
    private String status; // DRAFT 또는 FINAL
}