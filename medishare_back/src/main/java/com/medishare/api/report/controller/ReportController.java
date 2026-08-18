package com.medishare.api.report.controller;

import com.medishare.api.report.service.ReportService;
import com.medishare.api.report.vo.ReportVO;
import lombok.RequiredArgsConstructor;
import com.medishare.api.member.entity.Member;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/report")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/write.do")
    public ReportVO write(@RequestBody ReportVO vo, @AuthenticationPrincipal Member member) {
        return reportService.write(vo, member.getId());
    }

    @GetMapping("/view.do/{no}")
    public ReportVO view(@PathVariable Long no, @AuthenticationPrincipal Member member) {
        return reportService.view(no, member.getId());
    }

    @GetMapping("/list.do")
    public List<ReportVO> list(@RequestParam(required = false) Long studyNo,
                                @RequestParam(defaultValue = "FINAL") String status,
                                @AuthenticationPrincipal Member member) {
        return reportService.list(studyNo, status, member.getId());
    }

    @PutMapping("/update.do/{no}")
    public ReportVO update(@PathVariable Long no, @RequestBody ReportVO vo, @AuthenticationPrincipal Member member,
                           @RequestParam(required = false) String changeReason) {
        return reportService.update(no, vo, member.getId(), changeReason);
    }

    @DeleteMapping("/delete.do/{no}")
    public void delete(@PathVariable Long no, @AuthenticationPrincipal Member member,
                       @RequestParam(required = false) String changeReason) {
        reportService.delete(no, member.getId(), changeReason);
    }
}
