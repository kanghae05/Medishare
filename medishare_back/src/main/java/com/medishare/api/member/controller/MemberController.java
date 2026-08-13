package com.medishare.api.member.controller;

import com.medishare.api.data.dto.SignInResultDto;
import com.medishare.api.data.dto.SignUpResultDto;
import com.medishare.api.member.vo.LoginVO;
import com.medishare.api.member.vo.MemberVO;
import com.medishare.api.service.SignService;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/member")
@CrossOrigin(origins = "http://localhost:5173")
@Log4j2
public class MemberController {
    private final SignService signService;
    public MemberController(SignService signService) { this.signService = signService; }

    @PostMapping("/login.do")
    public SignInResultDto login(@RequestBody LoginVO vo) {
        log.info("[signIn] Login requested. id={}", vo.getId());
        SignInResultDto result = signService.signIn(vo.getId(), vo.getPw());
        if (result.getCode() == 0) log.info("[signIn] Login successful. id={}", vo.getId());
        return result;
    }

    @PostMapping("/write.do")
    public SignUpResultDto write(@RequestBody MemberVO vo) {
        return signService.signUp(vo);
    }
}
