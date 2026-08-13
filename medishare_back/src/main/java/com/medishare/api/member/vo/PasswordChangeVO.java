package com.medishare.api.member.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordChangeVO {
    private String currentPassword;
    private String newPassword;
    private String newPasswordConfirm;
}
