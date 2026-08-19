package com.medishare.api.specialcase.service;

import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.member.entity.Member;
import com.medishare.api.pacs.repository.PacsStudyRepository;
import com.medishare.api.report.entity.Report;
import com.medishare.api.report.repository.QReportRepository;
import com.medishare.api.specialcase.entity.SpecialCase;
import com.medishare.api.specialcase.repository.SpecialCaseRepository;
import com.medishare.api.specialcase.vo.SpecialCaseVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SpecialCaseServiceTest {

    @Mock
    private SpecialCaseRepository specialCaseRepository;
    @Mock
    private QMemberRepository memberRepository;
    @Mock
    private QReportRepository reportRepository;
    @Mock
    private PacsStudyRepository studyRepository;
    @Mock
    private WebClient orthancWebClient;

    private SpecialCaseService specialCaseService;

    @BeforeEach
    void setUp() {
        specialCaseService = new SpecialCaseService(
                specialCaseRepository,
                memberRepository,
                reportRepository,
                studyRepository,
                orthancWebClient
        );
    }

    @Test
    void adminCanDeleteAnotherWritersCase() {
        SpecialCase specialCase = mock(SpecialCase.class);
        when(specialCaseRepository.findActiveDetail(10L)).thenReturn(Optional.of(specialCase));

        specialCaseService.delete(10L, 2L, true);

        verify(specialCaseRepository).delete(specialCase);
    }

    @Test
    void nonAdminCannotDeleteAnotherWritersCase() {
        SpecialCase specialCase = mock(SpecialCase.class);
        when(specialCaseRepository.findActiveDetail(10L)).thenReturn(Optional.of(specialCase));
        when(specialCase.getWriterId()).thenReturn(1L);

        assertThrows(
                ResponseStatusException.class,
                () -> specialCaseService.delete(10L, 2L, false)
        );
        verify(specialCaseRepository, never()).delete(specialCase);
    }

    @Test
    void cannotCreateCaseFromAnotherMembersReport() {
        SpecialCaseVO request = new SpecialCaseVO();
        request.setReportId(20L);

        Report report = mock(Report.class);
        Member reportWriter = mock(Member.class);
        when(reportRepository.findById(20L)).thenReturn(Optional.of(report));
        when(report.getMember()).thenReturn(reportWriter);
        when(reportWriter.getNo()).thenReturn(1L);

        assertThrows(
                ResponseStatusException.class,
                () -> specialCaseService.create(2L, request)
        );
        verify(specialCaseRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
