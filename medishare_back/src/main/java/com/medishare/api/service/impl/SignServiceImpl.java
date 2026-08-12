package com.medishare.api.service.impl;

import com.medishare.api.common.CommonResponse;
import com.medishare.api.config.security.JwtTokenProvider;
import com.medishare.api.data.dto.SignInResultDto;
import com.medishare.api.data.dto.SignUpResultDto;
import com.medishare.api.data.entity.User;
import com.medishare.api.data.repository.UserRepository;
import com.medishare.api.member.entity.Member;
import com.medishare.api.member.repository.QMemberRepository;
import com.medishare.api.member.vo.MemberVO;
import com.medishare.api.service.SignService;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Log4j2
public class SignServiceImpl implements SignService {

    private final QMemberRepository qMemberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Autowired // 자동 DI
    public SignServiceImpl(QMemberRepository qMemberRepository, JwtTokenProvider jwtTokenProvider,
                           PasswordEncoder passwordEncoder){
        this.qMemberRepository = qMemberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public SignUpResultDto signUp(MemberVO vo) {
        log.info("[signUp] 회원가입 정보 전달 : vo = {}", vo);

        // DB 처리를 위한 Memer Entity에 데이터를 저장한다.
        // id, pw, name, gender, birth, tel, email, postNo, address, roles
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
        for (String role : vo.getRoles()){
            roles.add(role.equalsIgnoreCase("admin")?"ROLE_ADMIN":"ROLE_USER");
        }
        member.setRoles(roles);

        // 저장 처리를 하면 null 은 아니다.
        Member savedMember = qMemberRepository.save(member);

        // 회원 가입 등록 후 처리되는 데이터 리턴하기 위한 객체
        SignUpResultDto signUpResultDto = new SignUpResultDto();

        log.info("[signUp] Member Entity 값이 들어 왔는지 확인 후 결과값 주입");

        // 정상적으로 회원가입이 된 경우 처리
        if(!savedMember.getName().isEmpty()){
            log.info("[signUp] 정상 회원 가입 처리 완료");
            // 아래 메서드를 호출해서 처리
            setSuccessResult(signUpResultDto);
        } else {
            log.info("[signUp] 기본 라틴 문자로 변환 처리 실패~~~~~~");
            // 아래 메서드를 호출해서 처리
            setFailResult(signUpResultDto);
        }

        return signUpResultDto;
    }

    @Override
    public SignInResultDto signIn(String id, String pw) throws RuntimeException {
        log.info("[signIn] signDataHandler 로 회원 정보 요청 - id : {}, pw : {}", id, pw);
        Member member = qMemberRepository.findMemberById(id)
                .orElseThrow(() ->
                        new UsernameNotFoundException(id));
        log.info("[signIn] member : {}", member);

        log.info("[signIn] 패스워드 비교 수행");
        // 비밀번호가 같지 않으면 예외를 발생시킨다.
        if(!passwordEncoder.matches(pw, member.getPw())){
            throw new RuntimeException("패스워드가 다릅니다.");
        }

        log.info("[signIn] 패스워드 일치");
        log.info("[signIn] SignInResultDto 객체 생성");
        SignInResultDto signInResultDto = SignInResultDto.builder()
                .token(jwtTokenProvider.createToken(member.getId(), member.getName(), member.getRoles()))
                .build();

        log.info("[signIn] SignInResultDto 객체에 값 주입");
        setSuccessResult(signInResultDto); // 성공, 코드와 메시지 세팅

        // 토큰, 성공여부, 코드, 메시지 - 로그인 정보는 토큰 안에 들어 있다.
        return signInResultDto;
    }

    // return이 없는데 전달된 객체는 주소가 전달이 되서 메서드 안에서 수정하면 밖에서도 적용된다.
    private void setSuccessResult(SignUpResultDto result){
        result.setSuccess(true);
        result.setCode(CommonResponse.SUCCESS.getCode());
        result.setMsg(CommonResponse.SUCCESS.getMsg());
    }

    // return이 없는데 전달된 객체는 주소가 전달이 되서 메서드 안에서 수정하면 밖에서도 적용된다.
    private void setFailResult(SignUpResultDto result){
        result.setSuccess(false);
        result.setCode(CommonResponse.FAIL.getCode());
        result.setMsg(CommonResponse.FAIL.getMsg());
    }

}
