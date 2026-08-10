package com.medishare.api.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

// 인증 오류 메시지를 담는 객체
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class EntryPointErrorResponse {

    private  String msg;

}
