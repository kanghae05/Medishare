package com.medishare.api.pacs.repository;

import com.medishare.api.pacs.vo.StudyVO;

public interface PacsStudyRepositoryCustom {

    StudyVO getStudyDetail(String studyId);
}