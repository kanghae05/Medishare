package com.medishare.api.pacs.repository;

import com.medishare.api.pacs.entity.PacsPatient;
import com.medishare.api.pacs.entity.PacsSeries;
import com.medishare.api.pacs.entity.PacsStudy;
import com.medishare.api.pacs.vo.SeriesVO;
import com.medishare.api.pacs.vo.StudyVO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacsStudyRepositoryImpl
        implements PacsStudyRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public StudyVO getStudyDetail(String studyId) {

        if (studyId == null || studyId.isBlank()) {
            throw new IllegalArgumentException(
                    "Orthanc Study ID는 필수입니다."
            );
        }

        PacsStudy study = entityManager.createQuery(
                        """
                        select distinct ps
                        from PacsStudy ps
                        join fetch ps.patient patient
                        left join fetch ps.seriesList series
                        where ps.orthancStudyId = :studyId
                        """,
                        PacsStudy.class
                )
                .setParameter("studyId", studyId)
                .getResultStream()
                .findFirst()
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Study 정보를 찾을 수 없습니다. studyId="
                                        + studyId
                        )
                );

        return toStudyVO(study);
    }

    private StudyVO toStudyVO(PacsStudy study) {

        StudyVO studyVO = new StudyVO();

        studyVO.setOrthancStudyId(study.getOrthancStudyId());

        setPatientInfo(studyVO, study.getPatient());

        studyVO.setStudyInstanceUID(study.getStudyInstanceUID());
        studyVO.setAccessionNumber(study.getAccessionNumber());
        studyVO.setStudyDate(study.getStudyDate());
        studyVO.setStudyTime(study.getStudyTime());
        studyVO.setStudyDescription(study.getStudyDescription());

        studyVO.setReferringPhysicianName(
                study.getReferringPhysicianName()
        );

        studyVO.setRequestedProcedureDescription(
                study.getRequestedProcedureDescription()
        );

        studyVO.setStudyID(study.getStudyID());

        studyVO.setStable(Boolean.TRUE.equals(study.getStable()));

        List<SeriesVO> seriesList = toSeriesVOList(
                study.getSeriesList()
        );

        studyVO.setSeriesList(seriesList);

        studyVO.setSeriesCount(
                study.getSeriesCount() != null
                        ? study.getSeriesCount()
                        : seriesList.size()
        );

        studyVO.setInstanceCount(
                study.getInstanceCount() != null
                        ? study.getInstanceCount()
                        : calculateInstanceCount(seriesList)
        );

        return studyVO;
    }

    private void setPatientInfo(
            StudyVO studyVO,
            PacsPatient patient
    ) {

        if (patient == null) {
            return;
        }

        studyVO.setPatientId(patient.getPatientId());
        studyVO.setPatientName(patient.getPatientName());
        studyVO.setPatientSex(patient.getPatientSex());
        studyVO.setPatientBirthDate(patient.getPatientBirthDate());

        studyVO.setParentPatient(patient.getOrthancPatientId());
    }

    private List<SeriesVO> toSeriesVOList(
            List<PacsSeries> seriesList
    ) {

        if (seriesList == null || seriesList.isEmpty()) {
            return new ArrayList<>();
        }

        return seriesList.stream()
                .map(this::toSeriesVO)
                .sorted(seriesComparator())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private SeriesVO toSeriesVO(PacsSeries series) {

        SeriesVO seriesVO = new SeriesVO();

        seriesVO.setId(series.getOrthancSeriesId());

        seriesVO.setSeriesInstanceUID(
                series.getSeriesInstanceUID()
        );

        seriesVO.setModality(series.getModality());

        seriesVO.setSeriesDescription(
                series.getSeriesDescription()
        );

        seriesVO.setSeriesNumber(series.getSeriesNumber());

        seriesVO.setInstanceCount(
                series.getInstanceCount() != null
                        ? series.getInstanceCount()
                        : 0
        );

        return seriesVO;
    }

    private int calculateInstanceCount(
            List<SeriesVO> seriesList
    ) {

        return seriesList.stream()
                .map(SeriesVO::getInstanceCount)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();
    }

    private Comparator<SeriesVO> seriesComparator() {

        return Comparator.comparing(
                SeriesVO::getSeriesNumber,
                Comparator.nullsLast(this::compareSeriesNumber)
        );
    }

    private int compareSeriesNumber(
            String first,
            String second
    ) {

        try {
            return Integer.compare(
                    Integer.parseInt(first),
                    Integer.parseInt(second)
            );
        } catch (NumberFormatException e) {
            return first.compareTo(second);
        }
    }
}