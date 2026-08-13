package com.medishare.api.member.service;

import com.medishare.api.member.entity.Member;
import com.medishare.api.member.entity.PacsDepartment;
import com.medishare.api.member.repository.PacsDepartmentRepository;
import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.member.vo.MemberMyPageVO;
import com.medishare.api.member.vo.MemberUpdateVO;
import com.medishare.api.member.vo.PasswordChangeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberMyPageServiceImpl implements MemberMyPageService {
    private final QMemberRepository memberRepository;
    private final PacsDepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public MemberMyPageVO view(String loginId) { return toVO(findMember(loginId)); }

    @Override
    @Transactional
    public MemberMyPageVO update(String loginId, MemberUpdateVO request) {
        validateUpdate(request);
        Member member = findMember(loginId);
        if (!Objects.equals(normalizeEmail(member.getEmail()), normalizeEmail(request.getEmail()))) {
            memberRepository.findMemberByEmail(request.getEmail())
                    .filter(existing -> !existing.getNo().equals(member.getNo()))
                    .ifPresent(existing -> { throw new IllegalArgumentException("Email already exists."); });
        }
        member.setName(request.getName().trim());
        member.setEmail(request.getEmail().trim());
        member.setTel(blankToNull(request.getTel()));
        member.setDepartment(findActiveDepartment(request.getDepartmentNo()));
        member.setPosition(blankToNull(request.getPosition()));
        member.setSpecialty(blankToNull(request.getSpecialty()));
        return toVO(member);
    }

    @Override
    @Transactional
    public void changePassword(String loginId, PasswordChangeVO request) {
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) throw new IllegalArgumentException("Current password is required.");
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) throw new IllegalArgumentException("New password is required.");
        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) throw new IllegalArgumentException("New passwords do not match.");
        Member member = findMember(loginId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPw())) throw new IllegalArgumentException("Current password does not match.");
        if (passwordEncoder.matches(request.getNewPassword(), member.getPw())) throw new IllegalArgumentException("New password must differ from the current password.");
        member.setPw(passwordEncoder.encode(request.getNewPassword()));
    }

    private Member findMember(String loginId) {
        return memberRepository.findMemberById(loginId).orElseThrow(() -> new IllegalArgumentException("Member not found."));
    }
    private PacsDepartment findActiveDepartment(Long departmentNo) {
        if (departmentNo == null) throw new IllegalArgumentException("Department is required.");
        PacsDepartment department = departmentRepository.findById(departmentNo).orElseThrow(() -> new IllegalArgumentException("Department not found."));
        if (!"ACTIVE".equals(department.getStatus())) throw new IllegalArgumentException("Department is inactive.");
        return department;
    }
    private void validateUpdate(MemberUpdateVO request) {
        if (request.getName() == null || request.getName().isBlank()) throw new IllegalArgumentException("Name is required.");
        if (request.getEmail() == null || request.getEmail().isBlank()) throw new IllegalArgumentException("Email is required.");
    }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String normalizeEmail(String email) { return email == null ? null : email.trim().toLowerCase(); }
    private MemberMyPageVO toVO(Member member) {
        PacsDepartment department = member.getDepartment();
        return MemberMyPageVO.builder().memberNo(member.getNo()).loginId(member.getId()).name(member.getName())
                .email(member.getEmail()).tel(member.getTel()).departmentNo(department == null ? null : department.getNo())
                .departmentName(department == null ? null : department.getDepartmentName()).position(member.getPosition())
                .specialty(member.getSpecialty()).status(member.getStatus()).build();
    }
}
