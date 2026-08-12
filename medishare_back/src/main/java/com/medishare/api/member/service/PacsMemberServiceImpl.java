package com.medishare.api.member.service;

import com.medishare.api.member.entity.PacsDepartment;
import com.medishare.api.member.entity.PacsMember;
import com.medishare.api.member.repository.PacsDepartmentRepository;
import com.medishare.api.member.repository.PacsMemberRepository;
import com.medishare.api.member.vo.PacsMemberVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacsMemberServiceImpl implements PacsMemberService {

    private final PacsMemberRepository pacsMemberRepository;
    private final PacsDepartmentRepository pacsDepartmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<PacsMemberVO> list() {
        return pacsMemberRepository.findAll().stream().map(this::toVO).toList();
    }

    @Override
    public PacsMemberVO view(Long no) {
        return toVO(getMember(no));
    }

    @Override
    @Transactional
    public PacsMemberVO write(PacsMemberVO vo) {
        validateRequired(vo, true);
        validateDuplicate(null, vo);
        PacsMember member = PacsMember.builder()
                .loginId(vo.getLoginId()).password(passwordEncoder.encode(vo.getPassword()))
                .memberName(vo.getMemberName()).email(vo.getEmail()).phone(vo.getPhone())
                .department(getDepartment(vo.getDepartmentNo())).position(vo.getPosition()).specialty(vo.getSpecialty())
                .status(normalizeStatusOrDefault(vo.getStatus())).stable(vo.getStable()).build();
        return toVO(pacsMemberRepository.save(member));
    }

    @Override
    @Transactional
    public PacsMemberVO update(Long no, PacsMemberVO vo) {
        PacsMember member = getMember(no);
        validateRequired(vo, false);
        validateDuplicate(no, vo);
        member.setLoginId(vo.getLoginId()); member.setMemberName(vo.getMemberName());
        member.setEmail(vo.getEmail()); member.setPhone(vo.getPhone());
        member.setDepartment(getDepartment(vo.getDepartmentNo())); member.setPosition(vo.getPosition());
        member.setSpecialty(vo.getSpecialty());
        if (vo.getPassword() != null && !vo.getPassword().isBlank()) member.setPassword(passwordEncoder.encode(vo.getPassword()));
        if (vo.getStable() != null) member.setStable(vo.getStable());
        return toVO(member);
    }

    @Override
    @Transactional
    public PacsMemberVO changeStatus(Long no, String status) {
        PacsMember member = getMember(no);
        member.setStatus(normalizeStatus(status));
        return toVO(member);
    }

    private PacsMember getMember(Long no) {
        return pacsMemberRepository.findById(no).orElseThrow(() -> new IllegalArgumentException("PACS member not found."));
    }

    private PacsDepartment getDepartment(Long departmentNo) {
        if (departmentNo == null) return null;
        PacsDepartment department = pacsDepartmentRepository.findById(departmentNo)
                .orElseThrow(() -> new IllegalArgumentException("Department not found."));
        if (!"ACTIVE".equals(department.getStatus())) throw new IllegalArgumentException("Inactive department cannot be assigned.");
        return department;
    }

    private void validateRequired(PacsMemberVO vo, boolean passwordRequired) {
        if (vo.getLoginId() == null || vo.getLoginId().isBlank()) throw new IllegalArgumentException("Login ID is required.");
        if (vo.getMemberName() == null || vo.getMemberName().isBlank()) throw new IllegalArgumentException("Member name is required.");
        if (passwordRequired && (vo.getPassword() == null || vo.getPassword().isBlank())) throw new IllegalArgumentException("Password is required.");
    }

    private void validateDuplicate(Long no, PacsMemberVO vo) {
        pacsMemberRepository.findByLoginId(vo.getLoginId()).filter(member -> !member.getNo().equals(no))
                .ifPresent(member -> { throw new IllegalArgumentException("Login ID already exists."); });
        if (vo.getEmail() != null && !vo.getEmail().isBlank()) {
            pacsMemberRepository.findByEmail(vo.getEmail()).filter(member -> !member.getNo().equals(no))
                    .ifPresent(member -> { throw new IllegalArgumentException("Email already exists."); });
        }
    }

    private String normalizeStatus(String status) {
        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status)) throw new IllegalArgumentException("Status must be ACTIVE or INACTIVE.");
        return status;
    }

    private String normalizeStatusOrDefault(String status) {
        return (status == null || status.isBlank()) ? "ACTIVE" : normalizeStatus(status);
    }

    private PacsMemberVO toVO(PacsMember member) {
        PacsMemberVO vo = new PacsMemberVO();
        vo.setNo(member.getNo()); vo.setLoginId(member.getLoginId()); vo.setMemberName(member.getMemberName());
        vo.setEmail(member.getEmail()); vo.setPhone(member.getPhone()); vo.setPosition(member.getPosition());
        vo.setSpecialty(member.getSpecialty()); vo.setStatus(member.getStatus()); vo.setStable(member.getStable());
        if (member.getDepartment() != null) { vo.setDepartmentNo(member.getDepartment().getNo()); vo.setDepartmentName(member.getDepartment().getDepartmentName()); }
        return vo;
    }
}
