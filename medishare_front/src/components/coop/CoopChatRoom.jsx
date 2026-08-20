import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import CoopChatPanel from "./CoopChatPanel";
import CoopStudyDetailPanel from "./CoopStudyDetailPanel";
import CoopStudyImageViewer from "./CoopStudyImageViewer";
import "./Coop.css";

// 채팅에서 들어오는 전용 화면 - 채팅이 주인공이고, 협진 상세정보는 페이지 상단 버튼으로 모달을 열어서 본다.
function CoopChatRoom() {
  const [searchParams] = useSearchParams();
  const no = searchParams.get("no");
  const navigate = useNavigate();

  const [vo, setVo] = useState(null);
  const [reportSummary, setReportSummary] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!no) return;
    let ignore = false;
    api
      .get("/coop/view.do", { params: { no } })
      .then((res) => {
        if (!ignore) setVo(res.data);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [no]);

  useEffect(() => {
    if (!vo?.reportId) return;
    let ignore = false;
    api
      .get(`/coop/report/${vo.reportId}.do`)
      .then((res) => {
        if (!ignore) setReportSummary(res.data);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [vo?.reportId]);

  if (!vo) return null;

  const counterpartName = vo.direction === "sent" || vo.reqDoctorId
    ? (vo.acceptDoctorName || vo.reqDoctorName)
    : vo.reqDoctorName;

  return (
    <div className="coop-page">
      <div className="coop-header">
        <h3 className="coop-title">{counterpartName || "대화"} 님과의 대화</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="coop-chat-header-btn" onClick={() => navigate("/coop/chats")}>
            채팅목록
          </button>
          <button
            type="button"
            className="coop-chat-header-btn primary"
            onClick={() => setDetailModalOpen(true)}
          >
            협진 상세보기
          </button>
        </div>
      </div>

      <CoopChatPanel coopRequestId={vo.coopRequestId} pacsStudyId={vo.pacsStudyId} large />

      {detailModalOpen && (
        <div className="modal d-block coop-detail-modal" tabIndex={-1} role="dialog" onClick={() => setDetailModalOpen(false)}>
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title mb-0">협진 상세보기</h5>
                <button type="button" className="btn-close" onClick={() => setDetailModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="coop-view-card">
                  <div className="coop-view-grid">
                    <div>
                      <span className="coop-view-label">요청 의사</span>
                      <span className="coop-view-value">{vo.reqDoctorName}</span>
                    </div>
                    <div>
                      <span className="coop-view-label">수신 대상</span>
                      <span className="coop-view-value">
                        {vo.recvType === "지정의사" ? vo.recvDoctorName : vo.recvDeptName}
                        {vo.acceptDoctorId && ` → ${vo.acceptDoctorName} (수락)`}
                      </span>
                    </div>
                    <div>
                      <span className="coop-view-label">요청 시각</span>
                      <span className="coop-view-value">{vo.reqTime}</span>
                    </div>
                    <div>
                      <span className="coop-view-label">상태</span>
                      <span className={"coop-pill status-" + (vo.displayStatus || vo.status)}>
                        {vo.displayStatus || vo.status}
                      </span>
                    </div>
                    <div className="coop-view-span2">
                      <span className="coop-view-label">요청 내용</span>
                      <span className="coop-view-value">{vo.reqContent}</span>
                    </div>
                    {(vo.rejectReason || vo.viewerRejectReason) && (
                      <div className="coop-view-span2">
                        <span className="coop-view-label">거절 사유</span>
                        <span className="coop-view-value coop-view-danger">
                          {vo.rejectReason || vo.viewerRejectReason}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {vo.pacsStudyId && <CoopStudyDetailPanel pacsStudyId={vo.pacsStudyId} />}

                {reportSummary && (
                  <div className="coop-detail-panel">
                    <div className="coop-detail-section-title">
                      첨부 소견서
                      <span style={{ float: "right", fontWeight: 400, color: "var(--coop-faint)" }}>
                        {reportSummary.status === "FINAL" ? "최종 확정" : reportSummary.status === "DRAFT" ? "작성 중" : reportSummary.status}
                      </span>
                    </div>
                    <div className="coop-detail-section">
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{reportSummary.title}</div>
                      {reportSummary.findings && (
                        <div style={{ marginBottom: 10 }}>
                          <div className="coop-detail-label" style={{ display: "block", marginBottom: 3 }}>소견 (Findings)</div>
                          <div style={{ fontSize: 13, color: "var(--coop-ink)", whiteSpace: "pre-wrap" }}>{reportSummary.findings}</div>
                        </div>
                      )}
                      {reportSummary.impression && (
                        <div>
                          <div className="coop-detail-label" style={{ display: "block", marginBottom: 3 }}>판정 (Impression)</div>
                          <div style={{ fontSize: 13, color: "var(--coop-ink)", whiteSpace: "pre-wrap" }}>{reportSummary.impression}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 그리기는 채팅 입력창 "+"에서만 - 여기서는 coopRequestId를 안 넘겨서 그리기 버튼이 안 뜨게 한다 */}
                {vo.pacsStudyId && <CoopStudyImageViewer pacsStudyId={vo.pacsStudyId} />}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-coop-reset"
                  onClick={() => navigate(`/coop/view?no=${vo.coopRequestId}`)}
                >
                  협진 요청 화면으로 이동
                </button>
                <button type="button" className="btn-coop-apply" onClick={() => setDetailModalOpen(false)}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoopChatRoom;