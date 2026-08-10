package com.medishare.api.data.dto;

import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignInResultDto extends SignUpResultDto{

    private String token;

    public SignInResultDto(boolean success, int code, String msg, String token){
        super(success, code, msg);
        this.token = token;
    }

}
