package com.medishare.api.coop.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 검사 하나에 속한 시리즈 목록 항목 한 건 (검사당 시리즈가 여러 개일 수 있다) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeriesLookupVO {
    private Long seriesNo;
    private String modality;
    private String seriesDescription;
    private Integer instanceCount;
}