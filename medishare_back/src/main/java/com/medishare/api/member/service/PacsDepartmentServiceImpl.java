package com.medishare.api.member.service;

import com.medishare.api.member.entity.PacsDepartment;
import com.medishare.api.member.repository.PacsDepartmentRepository;
import com.medishare.api.member.vo.PacsDepartmentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PacsDepartmentServiceImpl implements PacsDepartmentService {

    private final PacsDepartmentRepository pacsDepartmentRepository;

    @Override
    public List<PacsDepartmentVO> list() {
        return pacsDepartmentRepository.findAll().stream().map(this::toVO).toList();
    }

    @Override
    public PacsDepartmentVO view(Long no) {
        return toVO(getDepartment(no));
    }

    @Override
    @Transactional
    public PacsDepartmentVO write(PacsDepartmentVO vo) {
        validateDepartmentName(vo.getDepartmentName());
        pacsDepartmentRepository.findByDepartmentName(vo.getDepartmentName()).ifPresent(department -> {
            throw new IllegalArgumentException("Department name already exists.");
        });
        PacsDepartment department = PacsDepartment.builder()
                .departmentName(vo.getDepartmentName()).description(vo.getDescription())
                .status(normalizeStatusOrDefault(vo.getStatus())).stable(vo.getStable()).build();
        return toVO(pacsDepartmentRepository.save(department));
    }

    @Override
    @Transactional
    public PacsDepartmentVO update(Long no, PacsDepartmentVO vo) {
        PacsDepartment department = getDepartment(no);
        validateDepartmentName(vo.getDepartmentName());
        pacsDepartmentRepository.findByDepartmentName(vo.getDepartmentName())
                .filter(found -> !found.getNo().equals(no))
                .ifPresent(found -> { throw new IllegalArgumentException("Department name already exists."); });
        department.setDepartmentName(vo.getDepartmentName());
        department.setDescription(vo.getDescription());
        if (vo.getStable() != null) department.setStable(vo.getStable());
        return toVO(department);
    }

    @Override
    @Transactional
    public PacsDepartmentVO changeStatus(Long no, String status) {
        PacsDepartment department = getDepartment(no);
        department.setStatus(normalizeStatus(status));
        return toVO(department);
    }

    private PacsDepartment getDepartment(Long no) {
        return pacsDepartmentRepository.findById(no)
                .orElseThrow(() -> new IllegalArgumentException("Department not found."));
    }

    private void validateDepartmentName(String departmentName) {
        if (departmentName == null || departmentName.isBlank()) throw new IllegalArgumentException("Department name is required.");
    }

    private String normalizeStatus(String status) {
        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status)) throw new IllegalArgumentException("Status must be ACTIVE or INACTIVE.");
        return status;
    }

    private String normalizeStatusOrDefault(String status) {
        return (status == null || status.isBlank()) ? "ACTIVE" : normalizeStatus(status);
    }

    private PacsDepartmentVO toVO(PacsDepartment department) {
        PacsDepartmentVO vo = new PacsDepartmentVO();
        vo.setNo(department.getNo()); vo.setDepartmentName(department.getDepartmentName());
        vo.setDescription(department.getDescription()); vo.setStatus(department.getStatus()); vo.setStable(department.getStable());
        return vo;
    }
}
