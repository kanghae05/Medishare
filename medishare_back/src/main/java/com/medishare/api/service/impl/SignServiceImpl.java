package com.medishare.api.service.impl;

import com.medishare.api.common.CommonResponse;
import com.medishare.api.config.security.JwtTokenProvider;
import com.medishare.api.data.dto.SignInResultDto;
import com.medishare.api.data.dto.SignUpResultDto;
import com.medishare.api.member.entity.Member;
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

    public SignServiceImpl(QMemberRepository qMemberRepository, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
        this.qMemberRepository = qMemberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public SignUpResultDto signUp(MemberVO vo) {
        Member member = new Member();
        member.setId(vo.getId());
        member.setPw(passwordEncoder.encode(vo.getPw()));
        member.setName(vo.getName());
        member.setGender(vo.getGender());
        member.setBirth(vo.getBirth());
        member.setTel(vo.getTel());
        member.setEmail(vo.getEmail());
        member.setPostNo(vo.getPostNo());
        member.setAddress(vo.getAddress());
        List<String> roles = new ArrayList<>();
        for (String role : vo.getRoles()) roles.add(role.equalsIgnoreCase("admin") ? "ROLE_ADMIN" : "ROLE_USER");
        member.setRoles(roles.isEmpty() ? List.of("ROLE_USER") : roles);

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
}
