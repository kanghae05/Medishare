package com.medishare.api.report.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportVO {
    private Long no;
    private Long studyNo;
    private String title;
    private String findings;
    private String impression;
    private String status;
    private String memberId;
    private String memberName;
    private LocalDateTime writeDate;
    private LocalDateTime updateDate;
}
