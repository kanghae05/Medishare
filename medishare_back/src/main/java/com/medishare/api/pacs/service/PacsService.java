package com.medishare.api.pacs.service;

import com.medishare.api.pacs.vo.StudySaveResultVO;
import com.medishare.api.pacs.vo.StudyVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface PacsService {

    // PACS Study 목록 조회
    List<StudyVO> getStudyList();

    // Study 상세 조회
    StudyVO getStudyDetail(String studyId);

    // Study 정보 수정
    StudyVO updateStudyInfo(Long no, StudyVO updateVO);

    // Orthanc 서버의 DICOM 메타데이터를 DB와 동기화
    StudySaveResultVO saveStudyFromOrthanc(String orthancStudyId);

    // DICOM 파일을 Orthanc PACS 서버에 업로드
    Map<String, Object> uploadDicom(MultipartFile file);

    // Study 대표 썸네일 이미지 조회
    byte[] getStudyThumbnail(String orthancStudyId);
}