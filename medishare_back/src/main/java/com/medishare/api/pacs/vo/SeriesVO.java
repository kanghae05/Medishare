package com.medishare.api.pacs.vo;

import lombok.Data;

@Data
public class SeriesVO {

    private String id;

    private String seriesInstanceUID;

    private String modality;

    private String seriesDescription;

    private Integer instanceCount = 0;

    private String seriesNumber;
}