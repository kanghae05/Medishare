package com.medishare.api.coop.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 안 읽은 협진요청 개수 (폴링 응답용) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnreadCountVO {
    private long unreadCount;
}