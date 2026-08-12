package com.medishare.api.pacs.controller;

import com.medishare.api.pacs.service.PacsService;
import com.medishare.api.pacs.vo.StudySaveResultVO;
import com.medishare.api.pacs.vo.StudyVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pacs")
@RequiredArgsConstructor
@Log4j2
public class PacsRestController {

    private final PacsService pacsService;


    // =========================================================
    // PACS Study 목록 조회
    // =========================================================
    @GetMapping("/list.do")
    @PreAuthorize("@pacsAuthorization.hasPermission(authentication, 'IMAGE_VIEW')")
    public ResponseEntity<List<StudyVO>> getStudyList() {

        return ResponseEntity.ok(
                pacsService.getStudyList()
        );
    }


    // =========================================================
    // PACS Study 상세 조회
    // =========================================================
    @GetMapping("/view.do")
    @PreAuthorize("@pacsAuthorization.hasPermission(authentication, 'IMAGE_VIEW')")
    public ResponseEntity<StudyVO> getStudyDetail(
            @RequestParam("id") String studyId
    ) {

        log.info(
                "[getStudyDetail] studyId={}",
                studyId
        );

        StudyVO study =
                pacsService.getStudyDetail(
                        studyId
                );

        return ResponseEntity.ok(
                study
        );
    }


    // =========================================================
    // DICOM 파일 Orthanc 업로드
    // =========================================================
    @PostMapping(
            value = "/upload.do",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> uploadDicom(
            @RequestPart("file") MultipartFile file
    ) {

        log.info(
                "[uploadDicom] fileName={}",
                file.getOriginalFilename()
        );

        Map<String, Object> result =
                pacsService.uploadDicom(
                        file
                );

        return ResponseEntity.ok(
                result
        );
    }


    // =========================================================
    // PACS Study 대표 썸네일 조회
    // =========================================================
    @GetMapping(
            value = "/thumbnail/{studyId}",
            produces = MediaType.IMAGE_PNG_VALUE
    )
    @PreAuthorize("@pacsAuthorization.hasPermission(authentication, 'IMAGE_VIEW')")
    public ResponseEntity<byte[]> getStudyThumbnail(
            @PathVariable String studyId
    ) {

        log.info(
                "[getStudyThumbnail] studyId={}",
                studyId
        );

        byte[] thumbnail =
                pacsService.getStudyThumbnail(
                        studyId
                );

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.IMAGE_PNG
                )
                .body(
                        thumbnail
                );
    }


    // =========================================================
    // Orthanc 전체 Study → DB 동기화
    // =========================================================
    @PostMapping("/sync.do")
    public ResponseEntity<StudySaveResultVO> syncAllStudies() {

        StudySaveResultVO result =
                pacsService.saveStudyFromOrthanc(
                        null
                );

        return ResponseEntity.ok(
                result
        );
    }


    // =========================================================
    // Orthanc 특정 Study → DB 동기화
    // =========================================================
    @PostMapping("/sync/{studyId}")
    public ResponseEntity<StudySaveResultVO> syncStudy(
            @PathVariable String studyId
    ) {

        StudySaveResultVO result =
                pacsService.saveStudyFromOrthanc(
                        studyId
                );

        return ResponseEntity.ok(
                result
        );
    }
}
