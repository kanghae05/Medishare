package com.medishare.api.coop.entity;

/**
 * 협진요청 수신 구분
 * - DB coop_request.recv_type ENUM('지정의사','진료과')과 1:1 매핑
 * - @Enumerated(EnumType.STRING) 사용 시 enum 상수명이 그대로 저장되므로
 *   상수명을 한글 ENUM 값과 동일하게 맞춘다.
 */
public enum RecvType {
    지정의사,
    진료과
}
