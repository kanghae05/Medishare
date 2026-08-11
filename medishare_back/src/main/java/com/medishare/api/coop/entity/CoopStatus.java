package com.medishare.api.coop.entity;

/**
 * 협진요청 상태
 * - DB coop_request.status ENUM('요청','수락','거절','취소','만료')과 1:1 매핑
 * - 진료과 요청에서 "다른 의사가 이미 처리해 나는 기회를 놓친 경우"는
 *   이 상태값을 바꾸는 것이 아니라, 조회 시점에 계산되는 표시상태(displayStatus)로
 *   별도 처리한다 (CoopRequestDisplayStatus 참고 - 서비스 계층에서 구현 예정).
 */
public enum CoopStatus {
    요청,
    수락,
    거절,
    취소,
    만료
}