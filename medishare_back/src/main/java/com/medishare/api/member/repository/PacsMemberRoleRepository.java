package com.medishare.api.member.repository;
import com.medishare.api.member.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PacsMemberRoleRepository extends JpaRepository<PacsMemberRole, PacsMemberRoleId> {
    List<PacsMemberRole> findByIdMemberNo(Long memberNo);
}
