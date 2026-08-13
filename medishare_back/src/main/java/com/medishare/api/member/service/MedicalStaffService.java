package com.medishare.api.member.service;

import com.medishare.api.member.vo.MedicalStaffDetailVO;
import com.medishare.api.member.vo.MedicalStaffListVO;
import com.medishare.api.member.vo.MedicalStaffUpdateVO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MedicalStaffService {
    Page<MedicalStaffListVO> list(String keyword, Long departmentNo, String status, Pageable pageable);
    MedicalStaffDetailVO detail(Long memberNo);
    MedicalStaffDetailVO update(Long memberNo, MedicalStaffUpdateVO request);
    MedicalStaffDetailVO changeStatus(Long memberNo, String status);
}
