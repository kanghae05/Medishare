package com.medishare.api.member.repository;
import com.medishare.api.member.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PacsRolePermissionRepository extends JpaRepository<PacsRolePermission, PacsRolePermissionId> {
    List<PacsRolePermission> findByIdRoleNo(Long roleNo);
}
