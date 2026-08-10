package com.medishare.api.service;

import com.medishare.api.data.dto.SignInResultDto;
import com.medishare.api.data.dto.SignUpResultDto;
import com.medishare.api.member.vo.MemberVO;

public interface SignService {

    //회원가입
    SignUpResultDto signUp(MemberVO vo);

    // 로그인
    SignInResultDto signIn(String id, String pw) throws RuntimeException;

}
