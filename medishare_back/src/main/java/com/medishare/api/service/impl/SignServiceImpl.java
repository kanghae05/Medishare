package com.medishare.api.service.impl;

import com.medishare.api.common.CommonResponse;
import com.medishare.api.config.security.JwtTokenProvider;
import com.medishare.api.data.dto.SignInResultDto;
import com.medishare.api.data.dto.SignUpResultDto;
import com.medishare.api.member.entity.Member;
import com.medishare.api.member.entity.PacsDepartment;
import com.medishare.api.member.repository.PacsDepartmentRepository;
import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.member.vo.MemberVO;
import com.medishare.api.service.SignService;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Log4j2
public class SignServiceImpl implements SignService {
    private final QMemberRepository qMemberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final PacsDepartmentRepository pacsDepartmentRepository;

    public SignServiceImpl(QMemberRepository qMemberRepository, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder,
                           PacsDepartmentRepository pacsDepartmentRepository) {
        this.qMemberRepository = qMemberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.pacsDepartmentRepository = pacsDepartmentRepository;
    }

    @Override
    @Transactional
    public SignUpResultDto signUp(MemberVO vo) {
        validateSignUp(vo);
        qMemberRepository.findMemberById(vo.getId()).ifPresent(member -> { throw new IllegalArgumentException("Login ID already exists."); });
        qMemberRepository.findMemberByEmail(vo.getEmail()).ifPresent(member -> { throw new IllegalArgumentException("Email already exists."); });
        PacsDepartment department = pacsDepartmentRepository.findById(vo.getDepartmentNo())
                .orElseThrow(() -> new IllegalArgumentException("Department not found."));
        if (!"ACTIVE".equals(department.getStatus())) throw new IllegalArgumentException("Department is inactive.");
        Member member = new Member();
        member.setId(vo.getId());
        member.setPw(passwordEncoder.encode(vo.getPw()));
        member.setName(vo.getName());
        member.setTel(vo.getTel());
        member.setEmail(vo.getEmail());
        member.setDepartment(department);
        member.setPosition(vo.getPosition());
        member.setRoles(List.of("ROLE_USER"));

        Member savedMember = qMemberRepository.save(member);
        SignUpResultDto result = new SignUpResultDto();
        if (savedMember.getName() != null && !savedMember.getName().isEmpty()) setSuccessResult(result);
        else setFailResult(result);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public SignInResultDto signIn(String id, String pw) {
        log.info("[signIn] Login requested. id={}", id);
        Member member = qMemberRepository.findMemberById(id)
                .orElseThrow(() -> new UsernameNotFoundException(id));
        log.info("[signIn] Member found. memberNo={}, loginId={}", member.getNo(), member.getId());

        if (!passwordEncoder.matches(pw, member.getPw())) {
            throw new RuntimeException("Invalid password.");
        }

        SignInResultDto result = SignInResultDto.builder()
                .token(jwtTokenProvider.createToken(member.getId(), member.getName(), member.getRoles()))
                .build();
        setSuccessResult(result);
        return result;
    }

    private void setSuccessResult(SignUpResultDto result) { result.setSuccess(true); result.setCode(CommonResponse.SUCCESS.getCode()); result.setMsg(CommonResponse.SUCCESS.getMsg()); }
    private void setFailResult(SignUpResultDto result) { result.setSuccess(false); result.setCode(CommonResponse.FAIL.getCode()); result.setMsg(CommonResponse.FAIL.getMsg()); }
    private void validateSignUp(MemberVO vo) {
        if (vo.getId() == null || vo.getId().isBlank()) throw new IllegalArgumentException("Login ID is required.");
        if (vo.getPw() == null || vo.getPw().isBlank()) throw new IllegalArgumentException("Password is required.");
        if (vo.getName() == null || vo.getName().isBlank()) throw new IllegalArgumentException("Name is required.");
        if (vo.getEmail() == null || vo.getEmail().isBlank()) throw new IllegalArgumentException("Email is required.");
        if (vo.getDepartmentNo() == null) throw new IllegalArgumentException("Department is required.");
        if (!"전문의".equals(vo.getPosition()) && !"전공의".equals(vo.getPosition())) {
            throw new IllegalArgumentException("Position must be 전문의 or 전공의.");
        }
    }
}
