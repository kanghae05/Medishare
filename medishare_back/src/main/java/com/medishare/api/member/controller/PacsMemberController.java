package com.medishare.api.member.controller;

import com.medishare.api.member.service.PacsMemberService;
import com.medishare.api.member.vo.PacsMemberVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pacs/members")
@RequiredArgsConstructor
public class PacsMemberController {
    private final PacsMemberService pacsMemberService;

    @GetMapping("/list.do") public List<PacsMemberVO> list() { return pacsMemberService.list(); }
    @GetMapping("/view.do/{no}") public PacsMemberVO view(@PathVariable Long no) { return pacsMemberService.view(no); }
    @PostMapping("/write.do") public PacsMemberVO write(@RequestBody PacsMemberVO vo) { return pacsMemberService.write(vo); }
    @PutMapping("/update.do/{no}") public PacsMemberVO update(@PathVariable Long no, @RequestBody PacsMemberVO vo) { return pacsMemberService.update(no, vo); }
    @PutMapping("/status.do/{no}") public PacsMemberVO status(@PathVariable Long no, @RequestBody Map<String, String> body) { return pacsMemberService.changeStatus(no, body.get("status")); }
}
