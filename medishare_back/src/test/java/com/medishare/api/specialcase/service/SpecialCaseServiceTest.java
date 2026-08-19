package com.medishare.api.specialcase.service;

import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.specialcase.entity.SpecialCase;
import com.medishare.api.specialcase.repository.SpecialCaseRepository;
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
    private WebClient orthancWebClient;

    private SpecialCaseService specialCaseService;

    @BeforeEach
    void setUp() {
        specialCaseService = new SpecialCaseService(
                specialCaseRepository,
                memberRepository,
                orthancWebClient
        );
    }

    @Test
    void adminCanDeleteAnotherWritersCase() {
        SpecialCase specialCase = mock(SpecialCase.class);
        when(specialCaseRepository.findActiveDetail(10L)).thenReturn(Optional.of(specialCase));

        specialCaseService.delete(10L, 2L, true);

        verify(specialCase).delete();
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
        verify(specialCase, never()).delete();
    }
}
