package com.medishare.api.coop.vo;

import lombok.Data;

import java.util.List;

/**
 * 협진요청 VO - 등록 요청(@RequestBody)과 목록/상세 응답을 겸용한다.
 *
 * - 등록 시 클라이언트가 채우는 필드: recvType, recvDoctorId, recvDeptId,
 *   patientId, pacsStudyId, reportId(선택), reqContent, originRequestId(재요청 시)
 * - 나머지(이름 필드, status, displayStatus 등)는 서버가 채워서 응답으로 내려준다.
 */
@Data
public class CoopRequestVO {
    private Long coopRequestId;

    private Long reqDoctorId;
    private String reqDoctorName;
    // 진료과·세부전공·직급 (" · "로 이어붙임), 본인("나")이면 비워둠
    private String reqDoctorMeta;

    // "지정의사" 또는 "진료과"
    private String recvType;

    private Long recvDoctorId;
    private String recvDoctorName;
    private String recvDoctorMeta;

    private Long recvDeptId;
    private String recvDeptName;

    // 실제 수락한 의사 (진료과 요청은 수락 전까지 null)
    private Long acceptDoctorId;
    private String acceptDoctorName;
    private String acceptDoctorMeta;

    private Long patientId;
    private String patientName;

    private Long pacsStudyId;
    // 검사 목록 표시용 (예: "CT 2026-08-10") - PACS 담당자 API 연동 후 채움
    private String pacsStudyLabel;

    private Long reportId;

    // 재요청(이메일 답장 패턴) - 이전 요청 ID
    private Long originRequestId;

    private String reqContent;

    // 실제 DB 상태값: 요청/수락/거절/취소/만료
    private String status;

    /**
     * 조회자 기준 표시상태 (계산값, DB에는 저장하지 않음)
     * - 진료과 요청에서 본인이 거절했으면 "거절",
     *   남이 수락해서 나는 응답 기회를 놓쳤으면 "종료" 등
     * - 지정의사 요청이거나 본인이 관련 당사자가 아니면 status와 동일
     */
    private String displayStatus;

    // 조회자가 수락/거절 버튼을 볼 수 있는지 (프론트 버튼 노출 판단용)
    private Boolean canRespond;

    private String reqTime;
    private String respTime;

    // 지정의사 요청 거절 사유
    private String rejectReason;

    // 전체 협진 내역 조회 시: "received" 또는 "sent"
    private String direction;

    // 진료과 요청 상세 조회 시 개인별 거절 목록 (의사명+사유)
    private List<CoopRequestDeptRejectVO> deptRejections;
}