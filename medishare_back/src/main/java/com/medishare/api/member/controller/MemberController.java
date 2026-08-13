package com.medishare.api.member.controller;

import com.medishare.api.data.dto.SignInResultDto;
import com.medishare.api.data.dto.SignUpResultDto;
import com.medishare.api.member.vo.LoginVO;
import com.medishare.api.member.vo.MemberVO;
import com.medishare.api.member.vo.PacsDepartmentVO;
import com.medishare.api.member.vo.MemberMyPageVO;
import com.medishare.api.member.vo.MemberUpdateVO;
import com.medishare.api.member.vo.PasswordChangeVO;
import com.medishare.api.member.service.MemberMyPageService;
import com.medishare.api.member.entity.MemberDetails;
import com.medishare.api.member.service.PacsDepartmentService;
import com.medishare.api.service.SignService;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/member")
@CrossOrigin(origins = "http://localhost:5173")
@Log4j2
public class MemberController {
    private final SignService signService;
    private final PacsDepartmentService pacsDepartmentService;
    private final MemberMyPageService memberMyPageService;
    public MemberController(SignService signService, PacsDepartmentService pacsDepartmentService, MemberMyPageService memberMyPageService) { this.signService = signService; this.pacsDepartmentService = pacsDepartmentService; this.memberMyPageService = memberMyPageService; }

    @GetMapping("/departments.do")
    public java.util.List<PacsDepartmentVO> departments() { return pacsDepartmentService.activeList(); }

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

    @GetMapping("/view")
    public MemberMyPageVO view(Authentication authentication) {
        return memberMyPageService.view(currentLoginId(authentication));
    }

    @PutMapping("/view")
    public MemberMyPageVO update(@RequestBody MemberUpdateVO request, Authentication authentication) {
        return memberMyPageService.update(currentLoginId(authentication), request);
    }

    @PutMapping("/password")
    public void changePassword(@RequestBody PasswordChangeVO request, Authentication authentication) {
        memberMyPageService.changePassword(currentLoginId(authentication), request);
    }

    private String currentLoginId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) throw new IllegalStateException("Authentication is required.");
        Object principal = authentication.getPrincipal();
        if (principal instanceof MemberDetails member) return member.getId();
        return authentication.getName();
    }
}
