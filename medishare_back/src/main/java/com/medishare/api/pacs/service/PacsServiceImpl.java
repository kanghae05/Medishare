package com.medishare.api.pacs.service;

import com.medishare.api.pacs.entity.PacsPatient;
import com.medishare.api.pacs.entity.PacsSeries;
import com.medishare.api.pacs.entity.PacsStudy;
import com.medishare.api.pacs.repository.PacsPatientRepository;
import com.medishare.api.pacs.repository.PacsSeriesRepository;
import com.medishare.api.pacs.repository.PacsStudyRepository;
import com.medishare.api.pacs.vo.StudySaveResultVO;
import com.medishare.api.pacs.vo.StudyVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Log4j2
public class PacsServiceImpl implements PacsService {

    // Orthanc PACS 서버 연결
    private final WebClient orthancWebClient;

    // Repository
    private final PacsPatientRepository pacsPatientRepository;
    private final PacsStudyRepository pacsStudyRepository;
    private final PacsSeriesRepository pacsSeriesRepository;


    // =========================================================
    // Study 목록 조회
    // =========================================================
    @Override
    public List<StudyVO> getStudyList() {

        return pacsStudyRepository.findStudyList();
    }


    // =========================================================
    // Study 상세 조회
    // =========================================================
    @Override
    @Transactional(readOnly = true)
    public StudyVO getStudyDetail(String studyId) {

        if (
                studyId == null
                        || studyId.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Orthanc Study ID는 필수입니다."
            );
        }


        log.info(
                "[getStudyDetail] DB Study 상세 조회 - orthancStudyId={}",
                studyId
        );


        return pacsStudyRepository
                .getStudyDetail(
                        studyId
                );
    }


    // =========================================================
    // Study 정보 수정
    // =========================================================
    @Override
    public StudyVO updateStudyInfo(
            Long no,
            StudyVO updateVO
    ) {

        return null;
    }


    // =========================================================
    // DICOM 파일 → Orthanc PACS 서버 업로드
    // =========================================================
    @Override
    public Map<String, Object> uploadDicom(
            MultipartFile file
    ) {

        if (
                file == null
                        || file.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "업로드할 DICOM 파일이 없습니다."
            );
        }


        try {

            log.info(
                    "[uploadDicom] DICOM 업로드 시작 - fileName={}",
                    file.getOriginalFilename()
            );


            Map<String, Object> result =
                    orthancWebClient
                            .post()
                            .uri(
                                    "/instances"
                            )
                            .contentType(
                                    MediaType.APPLICATION_OCTET_STREAM
                            )
                            .bodyValue(
                                    file.getBytes()
                            )
                            .retrieve()
                            .bodyToMono(
                                    new ParameterizedTypeReference<
                                            Map<String, Object>
                                            >() {
                                    }
                            )
                            .block();


            log.info(
                    "[uploadDicom] DICOM 업로드 완료 - result={}",
                    result
            );


            return result;


        } catch (Exception e) {

            log.error(
                    "[uploadDicom] DICOM 업로드 실패",
                    e
            );


            throw new RuntimeException(
                    "DICOM 파일 업로드에 실패했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // Study 대표 썸네일 이미지 조회
    // Study → 첫 Series → 첫 Instance → PNG Preview
    // =========================================================
    @Override
    public byte[] getStudyThumbnail(
            String orthancStudyId
    ) {

        if (
                orthancStudyId == null
                        || orthancStudyId.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Orthanc Study ID는 필수입니다."
            );
        }


        try {

            log.info(
                    "[getStudyThumbnail] 썸네일 조회 시작 - studyId={}",
                    orthancStudyId
            );


            // 1. Orthanc Study 정보 조회
            Map<String, Object> studyData =
                    getStudyFromOrthanc(
                            orthancStudyId
                    );


            if (studyData == null) {

                throw new RuntimeException(
                        "Study 정보를 찾을 수 없습니다."
                );
            }


            // 2. Study 안의 Series ID 목록 조회
            List<String> seriesIds =
                    getStringList(
                            studyData,
                            "Series"
                    );


            if (seriesIds.isEmpty()) {

                throw new RuntimeException(
                        "Study에 Series가 없습니다."
                );
            }


            // 3. 첫 번째 Series 정보 조회
            String firstSeriesId =
                    seriesIds.get(0);


            Map<String, Object> seriesData =
                    getSeriesFromOrthanc(
                            firstSeriesId
                    );


            if (seriesData == null) {

                throw new RuntimeException(
                        "Series 정보를 찾을 수 없습니다."
                );
            }


            // 4. Series 안의 Instance ID 목록 조회
            List<String> instanceIds =
                    getStringList(
                            seriesData,
                            "Instances"
                    );


            if (instanceIds.isEmpty()) {

                throw new RuntimeException(
                        "Series에 DICOM Instance가 없습니다."
                );
            }


            // 5. 첫 번째 Instance를 대표 썸네일로 사용
            String firstInstanceId =
                    instanceIds.get(0);


            // 6. Orthanc Preview API → PNG
            byte[] thumbnail =
                    orthancWebClient
                            .get()
                            .uri(
                                    "/instances/{id}/preview",
                                    firstInstanceId
                            )
                            .accept(
                                    MediaType.IMAGE_PNG
                            )
                            .retrieve()
                            .bodyToMono(
                                    byte[].class
                            )
                            .block();


            if (
                    thumbnail == null
                            || thumbnail.length == 0
            ) {

                throw new RuntimeException(
                        "썸네일 이미지 생성에 실패했습니다."
                );
            }


            log.info(
                    "[getStudyThumbnail] 썸네일 조회 완료 - studyId={}, size={}",
                    orthancStudyId,
                    thumbnail.length
            );


            return thumbnail;


        } catch (Exception e) {

            log.error(
                    "[getStudyThumbnail] 썸네일 조회 실패 - studyId={}",
                    orthancStudyId,
                    e
            );


            throw new RuntimeException(
                    "PACS Study 썸네일 조회에 실패했습니다.",
                    e
            );
        }
    }


    // =========================================================
    // Orthanc PACS 서버 → DB 메타데이터 동기화
    //
    // 신규 Study
    //      → DB INSERT
    //
    // 기존 Study
    //      → Orthanc 최신 상태로 UPDATE
    //      → Stable / Series Count / Instance Count 갱신
    // =========================================================
    @Override
    @Transactional
    public StudySaveResultVO saveStudyFromOrthanc(
            String orthancStudyId
    ) {

        List<String> orthancStudyIds;


        // =====================================================
        // 특정 Study만 동기화
        // =====================================================

        if (
                orthancStudyId != null
                        && !orthancStudyId.isBlank()
        ) {

            orthancStudyIds =
                    new ArrayList<>();


            orthancStudyIds.add(
                    orthancStudyId
            );

        } else {

            // =================================================
            // Orthanc 전체 Study 동기화
            // =================================================

            orthancStudyIds =
                    orthancWebClient
                            .get()
                            .uri(
                                    "/studies"
                            )
                            .retrieve()
                            .bodyToMono(
                                    new ParameterizedTypeReference<
                                            List<String>
                                            >() {
                                    }
                            )
                            .block();


            if (orthancStudyIds == null) {

                orthancStudyIds =
                        new ArrayList<>();
            }
        }


        log.info(
                "[saveStudyFromOrthanc] Orthanc Study IDs = {}",
                orthancStudyIds
        );


        int savedCount = 0;
        int skippedCount = 0;
        int failedCount = 0;


        // =====================================================
        // Study 하나씩 동기화
        // =====================================================

        for (String studyId : orthancStudyIds) {

            try {

                // =================================================
                // 1. Orthanc에서 최신 Study 정보 조회
                // =================================================

                Map<String, Object> studyDetailData =
                        getStudyFromOrthanc(
                                studyId
                        );


                if (studyDetailData == null) {

                    failedCount++;

                    continue;
                }


                // =================================================
                // 2. Study DICOM Tags
                // =================================================

                Map<String, String> studyTags =
                        getStringMap(
                                studyDetailData,
                                "MainDicomTags"
                        );


                String studyInstanceUID =
                        getTag(
                                studyTags,
                                "StudyInstanceUID"
                        );


                // =================================================
                // 3. 기존 Study 조회
                // =================================================

                PacsStudy existingStudy =
                        pacsStudyRepository
                                .findByOrthancStudyId(
                                        studyId
                                )
                                .orElse(null);


                // =================================================
                // 4. 기존 Study → UPDATE
                // =================================================

                if (existingStudy != null) {

                    log.info(
                            "[saveStudyFromOrthanc] 기존 Study 갱신 - studyId={}",
                            studyId
                    );


                    // Study UID
                    existingStudy
                            .setStudyInstanceUID(
                                    studyInstanceUID
                            );


                    // Accession Number
                    existingStudy
                            .setAccessionNumber(
                                    getTag(
                                            studyTags,
                                            "AccessionNumber"
                                    )
                            );


                    // Study Date
                    existingStudy
                            .setStudyDate(
                                    getTag(
                                            studyTags,
                                            "StudyDate"
                                    )
                            );


                    // Study Time
                    existingStudy
                            .setStudyTime(
                                    getTag(
                                            studyTags,
                                            "StudyTime"
                                    )
                            );


                    // Study Description
                    existingStudy
                            .setStudyDescription(
                                    getTag(
                                            studyTags,
                                            "StudyDescription"
                                    )
                            );


                    // Referring Physician
                    existingStudy
                            .setReferringPhysicianName(
                                    getTag(
                                            studyTags,
                                            "ReferringPhysicianName"
                                    )
                            );


                    // Requested Procedure
                    existingStudy
                            .setRequestedProcedureDescription(
                                    getTag(
                                            studyTags,
                                            "RequestedProcedureDescription"
                                    )
                            );


                    // Study ID
                    existingStudy
                            .setStudyID(
                                    getTag(
                                            studyTags,
                                            "StudyID"
                                    )
                            );


                    // ★ Orthanc 최신 Stable 상태
                    existingStudy
                            .setStable(
                                    getBoolean(
                                            studyDetailData,
                                            "IsStable"
                                    )
                            );


                    // Study 저장
                    pacsStudyRepository
                            .save(
                                    existingStudy
                            );


                    // Series + Instance 최신화
                    saveSeriesList(
                            studyDetailData,
                            existingStudy
                    );


                    savedCount++;


                    continue;
                }


                // =================================================
                // 5. 신규 Study인데 UID가 이미 존재하면 Skip
                // =================================================

                if (
                        studyInstanceUID != null
                                && !studyInstanceUID.isBlank()
                                && pacsStudyRepository
                                .existsByStudyInstanceUID(
                                        studyInstanceUID
                                )
                ) {

                    skippedCount++;

                    continue;
                }


                // =================================================
                // 6. Patient 저장 / 조회
                // =================================================

                PacsPatient patient =
                        findOrCreatePatient(
                                studyDetailData
                        );


                // =================================================
                // 7. 신규 Study Entity 생성
                // =================================================

                PacsStudy study =
                        createStudyEntity(
                                studyDetailData,
                                studyTags,
                                patient
                        );


                // =================================================
                // 8. 신규 Study 저장
                // =================================================

                PacsStudy savedStudy =
                        pacsStudyRepository
                                .save(
                                        study
                                );


                // =================================================
                // 9. Series 저장
                // =================================================

                saveSeriesList(
                        studyDetailData,
                        savedStudy
                );


                savedCount++;


            } catch (Exception e) {

                failedCount++;


                log.error(
                        "[saveStudyFromOrthanc] Study 동기화 실패 - studyId={}",
                        studyId,
                        e
                );
            }
        }


        // =====================================================
        // 결과 반환
        // =====================================================

        return StudySaveResultVO
                .builder()
                .totalCount(
                        orthancStudyIds.size()
                )
                .savedCount(
                        savedCount
                )
                .skippedCount(
                        skippedCount
                )
                .failedCount(
                        failedCount
                )
                .build();
    }


    // =========================================================
    // Patient 조회 또는 신규 저장
    // =========================================================
    private PacsPatient findOrCreatePatient(
            Map<String, Object> studyDetailData
    ) throws Exception {

        String orthancPatientId =
                getString(
                        studyDetailData,
                        "ParentPatient"
                );


        if (
                orthancPatientId == null
                        || orthancPatientId.isBlank()
        ) {

            throw new Exception(
                    "Orthanc Patient ID가 없습니다."
            );
        }


        return pacsPatientRepository
                .findByOrthancPatientId(
                        orthancPatientId
                )
                .orElseGet(() -> {


                    Map<String, String> patientTags =
                            getStringMap(
                                    studyDetailData,
                                    "PatientMainDicomTags"
                            );


                    PacsPatient patient =
                            PacsPatient
                                    .builder()
                                    .orthancPatientId(
                                            orthancPatientId
                                    )
                                    .patientId(
                                            getTag(
                                                    patientTags,
                                                    "PatientID"
                                            )
                                    )
                                    .patientName(
                                            getTag(
                                                    patientTags,
                                                    "PatientName"
                                            )
                                    )
                                    .patientSex(
                                            getTag(
                                                    patientTags,
                                                    "PatientSex"
                                            )
                                    )
                                    .patientBirthDate(
                                            getTag(
                                                    patientTags,
                                                    "PatientBirthDate"
                                            )
                                    )
                                    .stable(
                                            getBoolean(
                                                    studyDetailData,
                                                    "IsStable"
                                            )
                                    )
                                    .build();


                    return pacsPatientRepository
                            .save(
                                    patient
                            );
                });
    }


    // =========================================================
    // Orthanc Study 상세 조회
    // =========================================================
    public Map<String, Object> getStudyFromOrthanc(
            String orthancStudyId
    ) {

        return orthancWebClient
                .get()
                .uri(
                        "/studies/{id}",
                        orthancStudyId
                )
                .retrieve()
                .bodyToMono(
                        new ParameterizedTypeReference<
                                Map<String, Object>
                                >() {
                        }
                )
                .block();
    }


    // =========================================================
    // Study Entity 생성
    // =========================================================
    private PacsStudy createStudyEntity(
            Map<String, Object> studyData,
            Map<String, String> studyTags,
            PacsPatient patient
    ) {

        String orthancStudyId =
                getString(
                        studyData,
                        "ID"
                );


        List<String> seriesIds =
                getStringList(
                        studyData,
                        "Series"
                );


        PacsStudy study =
                PacsStudy
                        .builder()
                        .orthancStudyId(
                                orthancStudyId
                        )
                        .studyInstanceUID(
                                getTag(
                                        studyTags,
                                        "StudyInstanceUID"
                                )
                        )
                        .accessionNumber(
                                getTag(
                                        studyTags,
                                        "AccessionNumber"
                                )
                        )
                        .studyDate(
                                getTag(
                                        studyTags,
                                        "StudyDate"
                                )
                        )
                        .studyTime(
                                getTag(
                                        studyTags,
                                        "StudyTime"
                                )
                        )
                        .studyDescription(
                                getTag(
                                        studyTags,
                                        "StudyDescription"
                                )
                        )
                        .referringPhysicianName(
                                getTag(
                                        studyTags,
                                        "ReferringPhysicianName"
                                )
                        )
                        .requestedProcedureDescription(
                                getTag(
                                        studyTags,
                                        "RequestedProcedureDescription"
                                )
                        )
                        .studyID(
                                getTag(
                                        studyTags,
                                        "StudyID"
                                )
                        )
                        .stable(
                                getBoolean(
                                        studyData,
                                        "IsStable"
                                )
                        )
                        .seriesCount(
                                seriesIds.size()
                        )
                        .instanceCount(
                                0
                        )
                        .patient(
                                patient
                        )
                        .build();


        patient
                .getStudyList()
                .add(
                        study
                );


        return study;
    }


    // =========================================================
    // Series 목록 저장 / 최신 정보 갱신
    // =========================================================
    private void saveSeriesList(
            Map<String, Object> studyData,
            PacsStudy study
    ) {

        List<String> orthancSeriesIds =
                getStringList(
                        studyData,
                        "Series"
                );


        int totalInstanceCount = 0;


        for (
                String orthancSeriesId
                : orthancSeriesIds
        ) {

            // =================================================
            // Orthanc Series 상세 조회
            // =================================================

            Map<String, Object> seriesData =
                    getSeriesFromOrthanc(
                            orthancSeriesId
                    );


            if (seriesData == null) {

                continue;
            }


            Map<String, String> seriesTags =
                    getStringMap(
                            seriesData,
                            "MainDicomTags"
                    );


            String seriesInstanceUID =
                    getTag(
                            seriesTags,
                            "SeriesInstanceUID"
                    );


            List<String> instanceIds =
                    getStringList(
                            seriesData,
                            "Instances"
                    );


            int instanceCount =
                    instanceIds.size();


            // 전체 Instance 개수 누적
            totalInstanceCount +=
                    instanceCount;


            // =================================================
            // 기존 Series 조회
            // =================================================

            PacsSeries existingSeries =
                    pacsSeriesRepository
                            .findByOrthancSeriesId(
                                    orthancSeriesId
                            )
                            .orElse(null);


            // =================================================
            // 기존 Series → UPDATE
            // =================================================

            if (existingSeries != null) {

                existingSeries
                        .setSeriesInstanceUID(
                                seriesInstanceUID
                        );


                existingSeries
                        .setModality(
                                getTag(
                                        seriesTags,
                                        "Modality"
                                )
                        );


                existingSeries
                        .setSeriesDescription(
                                getTag(
                                        seriesTags,
                                        "SeriesDescription"
                                )
                        );


                existingSeries
                        .setSeriesNumber(
                                getTag(
                                        seriesTags,
                                        "SeriesNumber"
                                )
                        );


                existingSeries
                        .setInstanceCount(
                                instanceCount
                        );


                pacsSeriesRepository
                        .save(
                                existingSeries
                        );


                continue;
            }


            // =================================================
            // 동일 SeriesInstanceUID가 이미 존재하면 Skip
            // =================================================

            if (
                    seriesInstanceUID != null
                            && !seriesInstanceUID.isBlank()
                            && pacsSeriesRepository
                            .existsBySeriesInstanceUID(
                                    seriesInstanceUID
                            )
            ) {

                continue;
            }


            // =================================================
            // 신규 Series 생성
            // =================================================

            PacsSeries series =
                    PacsSeries
                            .builder()
                            .orthancSeriesId(
                                    orthancSeriesId
                            )
                            .seriesInstanceUID(
                                    seriesInstanceUID
                            )
                            .modality(
                                    getTag(
                                            seriesTags,
                                            "Modality"
                                    )
                            )
                            .seriesDescription(
                                    getTag(
                                            seriesTags,
                                            "SeriesDescription"
                                    )
                            )
                            .seriesNumber(
                                    getTag(
                                            seriesTags,
                                            "SeriesNumber"
                                    )
                            )
                            .instanceCount(
                                    instanceCount
                            )
                            .study(
                                    study
                            )
                            .build();


            study
                    .getSeriesList()
                    .add(
                            series
                    );


            pacsSeriesRepository
                    .save(
                            series
                    );
        }


        // =====================================================
        // Orthanc 기준 Series 개수
        // =====================================================

        study
                .setSeriesCount(
                        orthancSeriesIds.size()
                );


        // =====================================================
        // Orthanc 기준 전체 Instance 개수
        // =====================================================

        study
                .setInstanceCount(
                        totalInstanceCount
                );


        pacsStudyRepository
                .save(
                        study
                );
    }


    // =========================================================
    // Orthanc Series 상세 조회
    // =========================================================
    private Map<String, Object> getSeriesFromOrthanc(
            String orthancSeriesId
    ) {

        return orthancWebClient
                .get()
                .uri(
                        "/series/{id}",
                        orthancSeriesId
                )
                .retrieve()
                .bodyToMono(
                        new ParameterizedTypeReference<
                                Map<String, Object>
                                >() {
                        }
                )
                .block();
    }


    // =========================================================
    // Map → Map<String, String>
    // =========================================================
    @SuppressWarnings("unchecked")
    private Map<String, String> getStringMap(
            Map<String, Object> data,
            String key
    ) {

        if (data == null) {

            return null;
        }


        Object value =
                data.get(
                        key
                );


        if (value instanceof Map<?, ?>) {

            return (Map<String, String>) value;
        }


        return null;
    }


    // =========================================================
    // DICOM Tag 값 조회
    // =========================================================
    private String getTag(
            Map<String, String> tags,
            String key
    ) {

        if (tags == null) {

            return null;
        }


        return tags.get(
                key
        );
    }


    // =========================================================
    // String 값 조회
    // =========================================================
    private String getString(
            Map<String, Object> data,
            String key
    ) {

        if (data == null) {

            return null;
        }


        Object value =
                data.get(
                        key
                );


        return value == null
                ? null
                : String.valueOf(
                value
        );
    }


    // =========================================================
    // Boolean 값 조회
    // =========================================================
    private Boolean getBoolean(
            Map<String, Object> data,
            String key
    ) {

        if (data == null) {

            return false;
        }


        Object value =
                data.get(
                        key
                );


        if (value instanceof Boolean booleanValue) {

            return booleanValue;
        }


        if (value instanceof String stringValue) {

            return Boolean.parseBoolean(
                    stringValue
            );
        }


        return false;
    }


    // =========================================================
    // List<String> 값 조회
    // =========================================================
    @SuppressWarnings("unchecked")
    private List<String> getStringList(
            Map<String, Object> data,
            String key
    ) {

        if (data == null) {

            return new ArrayList<>();
        }


        Object value =
                data.get(
                        key
                );


        if (value instanceof List<?>) {

            return (List<String>) value;
        }


        return new ArrayList<>();
    }
}