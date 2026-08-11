package com.medishare.api.pacs.repository;

import com.medishare.api.pacs.entity.PacsSeries;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PacsSeriesRepository
        extends JpaRepository<PacsSeries, Long> {

    Optional<PacsSeries> findByOrthancSeriesId(String orthancSeriesId);

    Optional<PacsSeries> findBySeriesInstanceUID(String seriesInstanceUID);

    boolean existsByOrthancSeriesId(String orthancSeriesId);

    boolean existsBySeriesInstanceUID(String seriesInstanceUID);
}