package com.medishare.api.member.repository;
import com.medishare.api.member.entity.PacsPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PacsPermissionRepository extends JpaRepository<PacsPermission, Long> { Optional<PacsPermission> findByPermissionCode(String permissionCode); }
