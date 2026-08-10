package com.medishare.api.member.controller;

import com.medishare.api.data.dto.SignInResultDto;
import com.medishare.api.data.dto.SignUpResultDto;
import com.medishare.api.member.vo.LoginVO;
import com.medishare.api.member.vo.MemberVO;
import com.medishare.api.service.SignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/member")
@CrossOrigin(origins = "http://localhost:5173") // react 서버로 데이터 공유 허용해준다.
@Log4j2
public class MemberController {

    // service 자동 DI
    private final SignService signService;

    @Autowired // 생성자를 이용한 자동 DI
    public MemberController(SignService signService){
        this.signService = signService;
    }

    //로그인 처리
    @PostMapping("/login.do") //  /sign-api/sign-in
    @Operation(summary = "(로그인)")
    public SignInResultDto login(
            @RequestBody LoginVO vo
            ) throws RuntimeException {

        // 넘겨 받은 데이터에서 필요한 데이터 꺼내기.
        String id = vo.getId();
        String pw = vo.getPw();

        // 넘어오는 데이터 확인하기
        log.info("[signIn] 로그인 시도를 하고 있습니다. id : {}, pw : {}", id, pw);
        // 정상적인 로그인 처리가 되어서 데이터를 가져오거나 정보가 틀리면 예외가 발생된다.
        SignInResultDto signInResultDto = signService.signIn(id, pw);

        if(signInResultDto.getCode() == 0){
            // signInResultDto - success, code, msg, token
            log.info("[signIn] 정상적으로 로그인되었습니다. id : {}, token : {}",
                   id, signInResultDto.getToken());
        }

        // 토큰이 포함됨. - react에서 X-AUTH-TOKEN 헤더에 추가해서 서버에 보내야한다.
        return signInResultDto;
    }

    @PostMapping("/write.do") //  /sign-api/sign-up
    @Operation(summary = "(회원가입)")
    public SignUpResultDto write(
            @RequestBody MemberVO vo
    ){

        // 넘어온 데이터 확인
        log.info("[signUp] 회원가입을 수행합니다. vo : {}", vo);
        // DB에 적용
        SignUpResultDto signUpResultDto = signService.signUp(vo);
        log.info("[signUp] 회원가입을 완료했습니다.");
        log.info("[signUp] signUpResultDto : {}", signUpResultDto);

        // success, code, msg
        return signUpResultDto;
    }

}
