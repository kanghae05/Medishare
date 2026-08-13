package com.medishare.api.member.service;

import com.medishare.api.member.entity.Member;
import com.medishare.api.member.entity.PacsDepartment;
import com.medishare.api.member.repository.PacsDepartmentRepository;
import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.member.vo.MedicalStaffDetailVO;
import com.medishare.api.member.vo.MedicalStaffListVO;
import com.medishare.api.member.vo.MedicalStaffUpdateVO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedicalStaffServiceImpl implements MedicalStaffService {
    private static final Set<String> AVAILABLE_STATUSES = Set.of("ACTIVE", "INACTIVE", "SUSPENDED");

    private final QMemberRepository memberRepository;
    private final PacsDepartmentRepository departmentRepository;

    @Override
    public Page<MedicalStaffListVO> list(String keyword, Long departmentNo, String status, Pageable pageable) {
        return memberRepository.searchMedicalStaff(normalizeKeyword(keyword), departmentNo, normalizeStatus(status), pageable)
                .map(this::toListVO);
    }

    @Override
    public MedicalStaffDetailVO detail(Long memberNo) {
        return toDetailVO(findMember(memberNo));
    }

    @Override
    @Transactional
    public MedicalStaffDetailVO update(Long memberNo, MedicalStaffUpdateVO request) {
        Member member = findMember(memberNo);
        validateUpdate(request);
        if (!member.getEmail().equalsIgnoreCase(request.getEmail())) {
            memberRepository.findMemberByEmail(request.getEmail())
                    .filter(existing -> !existing.getNo().equals(memberNo))
                    .ifPresent(existing -> { throw new IllegalArgumentException("Email already exists."); });
        }
        PacsDepartment department = findActiveDepartment(request.getDepartmentNo());
        member.setName(request.getName().trim());
        member.setEmail(request.getEmail().trim());
        member.setTel(blankToNull(request.getTel()));
        member.setDepartment(department);
        member.setPosition(blankToNull(request.getPosition()));
        member.setSpecialty(blankToNull(request.getSpecialty()));
        if (request.getStatus() != null && !request.getStatus().isBlank()) member.setStatus(normalizeStatus(request.getStatus()));
        return toDetailVO(member);
    }

    @Override
    @Transactional
    public MedicalStaffDetailVO changeStatus(Long memberNo, String status) {
        Member member = findMember(memberNo);
        member.setStatus(requiredStatus(status));
        return toDetailVO(member);
    }

    private Member findMember(Long memberNo) {
        return memberRepository.findById(memberNo)
                .orElseThrow(() -> new IllegalArgumentException("Member not found."));
    }

    private PacsDepartment findActiveDepartment(Long departmentNo) {
        if (departmentNo == null) throw new IllegalArgumentException("Department is required.");
        PacsDepartment department = departmentRepository.findById(departmentNo)
                .orElseThrow(() -> new IllegalArgumentException("Department not found."));
        if (!"ACTIVE".equals(department.getStatus())) throw new IllegalArgumentException("Department is inactive.");
        return department;
    }

    private void validateUpdate(MedicalStaffUpdateVO request) {
        if (request.getName() == null || request.getName().isBlank()) throw new IllegalArgumentException("Name is required.");
        if (request.getEmail() == null || request.getEmail().isBlank()) throw new IllegalArgumentException("Email is required.");
        if (request.getStatus() != null && !request.getStatus().isBlank()) requiredStatus(request.getStatus());
    }

    private String normalizeKeyword(String keyword) { return keyword == null || keyword.isBlank() ? null : keyword.trim(); }
    private String normalizeStatus(String status) { return status == null || status.isBlank() ? null : requiredStatus(status); }
    private String requiredStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!AVAILABLE_STATUSES.contains(normalized)) throw new IllegalArgumentException("Unsupported member status.");
        return normalized;
    }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private MedicalStaffListVO toListVO(Member member) {
        PacsDepartment department = member.getDepartment();
        return MedicalStaffListVO.builder().memberNo(member.getNo()).loginId(member.getId()).name(member.getName())
                .email(member.getEmail()).tel(member.getTel()).departmentNo(department == null ? null : department.getNo())
                .departmentName(department == null ? null : department.getDepartmentName()).position(member.getPosition())
                .specialty(member.getSpecialty()).status(member.getStatus()).stable(member.getStable()).build();
    }
    private MedicalStaffDetailVO toDetailVO(Member member) {
        PacsDepartment department = member.getDepartment();
        return MedicalStaffDetailVO.builder().memberNo(member.getNo()).loginId(member.getId()).name(member.getName())
                .email(member.getEmail()).tel(member.getTel()).departmentNo(department == null ? null : department.getNo())
                .departmentName(department == null ? null : department.getDepartmentName()).position(member.getPosition())
                .specialty(member.getSpecialty()).status(member.getStatus()).stable(member.getStable()).build();
    }
}
