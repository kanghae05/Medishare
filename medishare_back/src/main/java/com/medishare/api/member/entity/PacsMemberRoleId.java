package com.medishare.api.member.entity;

import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class PacsMemberRoleId implements Serializable { private Long memberNo; private Long roleNo; }
