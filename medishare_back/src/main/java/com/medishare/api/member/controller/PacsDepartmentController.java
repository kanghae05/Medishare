package com.medishare.api.member.controller;

import com.medishare.api.member.service.PacsDepartmentService;
import com.medishare.api.member.vo.PacsDepartmentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pacs/departments")
@RequiredArgsConstructor
public class PacsDepartmentController {
    private final PacsDepartmentService pacsDepartmentService;

    @GetMapping("/list.do") public List<PacsDepartmentVO> list() { return pacsDepartmentService.list(); }
    @GetMapping("/view.do/{no}") public PacsDepartmentVO view(@PathVariable Long no) { return pacsDepartmentService.view(no); }
    @PostMapping("/write.do") public PacsDepartmentVO write(@RequestBody PacsDepartmentVO vo) { return pacsDepartmentService.write(vo); }
    @PutMapping("/update.do/{no}") public PacsDepartmentVO update(@PathVariable Long no, @RequestBody PacsDepartmentVO vo) { return pacsDepartmentService.update(no, vo); }
    @PutMapping("/status.do/{no}") public PacsDepartmentVO status(@PathVariable Long no, @RequestBody Map<String, String> body) { return pacsDepartmentService.changeStatus(no, body.get("status")); }
}
