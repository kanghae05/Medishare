package com.medishare.api.member.service;

import com.medishare.api.member.vo.PacsDepartmentVO;

import java.util.List;

public interface PacsDepartmentService {
    List<PacsDepartmentVO> list();
    PacsDepartmentVO view(Long no);
    PacsDepartmentVO write(PacsDepartmentVO vo);
    PacsDepartmentVO update(Long no, PacsDepartmentVO vo);
    PacsDepartmentVO changeStatus(Long no, String status);
}
