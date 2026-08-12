package com.medishare.api.member.service;

import com.medishare.api.member.vo.PacsMemberVO;

import java.util.List;

public interface PacsMemberService {
    List<PacsMemberVO> list();
    PacsMemberVO view(Long no);
    PacsMemberVO write(PacsMemberVO vo);
    PacsMemberVO update(Long no, PacsMemberVO vo);
    PacsMemberVO changeStatus(Long no, String status);
}
