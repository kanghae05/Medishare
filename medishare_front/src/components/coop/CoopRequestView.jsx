import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import CoopReasonModal from "./CoopReasonModal";
import CoopChatPanel from "./CoopChatPanel";
import CoopStudyDetailPanel from "./CoopStudyDetailPanel";
import CoopStudyImageViewer from "./CoopStudyImageViewer";
import "./Coop.css";

// 의사명 + 메타(진료과·세부전공·직급)를 같이 표시. 이름이 없으면 번호로 폴백.
function renderDoctor(name, meta, id) {
  if (!name) return `의사 #${id}`;
  return (
    <>
      {name}
      {meta && <span className="coop-doctor-meta"> ({meta})</span>}
    </>
  );
}

function CoopRequestView() {
  const [searchParams] = useSearchParams();
  const no = searchParams.get("no");
  const navigate = useNavigate();

  const [vo, setVo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [modal, setModal] = useState(null); // "reject" | "deptReject" | null
  const [chatOpen, setChatOpen] = useState(false);

  const load = () => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) {
        setLoading(true);
        setError(null);
      }
    });
    api
      .get("/coop/view.do", { params: { no } })
      .then((res) => {
        if (!ignore) setVo(res.data);
      })
      .catch(() => {
        if (!ignore) setError("협진 요청 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  };

  useEffect(load, [no]);

  const runAction = (promise) => {
    setProcessing(true);
    setActionError(null);
    promise
      .then(() => {
        setModal(null);
        load();
      })
      .catch((err) => {
        const message = err.response?.data?.message || err.response?.data?.error || "처리에 실패했습니다.";
        setActionError(message);
      })
      .finally(() => setProcessing(false));
  };

  const handleAccept = () => {
    if (!window.confirm("이 협진 요청을 수락하시겠습니까?")) return;
    runAction(api.post("/coop/accept.do", { no }));
  };

  const handleReject = (reason) => {
    runAction(api.post("/coop/reject.do", { no, rejectReason: reason }));
  };

  const handleDeptReject = (reason) => {
    runAction(api.post("/coop/deptReject.do", { no, rejectReason: reason }));
  };

  const handleCancel = () => {
    if (!window.confirm("이 협진 요청을 취소하시겠습니까?")) return;
    runAction(api.post("/coop/cancel.do", { no }));
  };

  if (loading) return <div className="text-center py-5 text-muted">불러오는 중...</div>;
  if (error) return <div className="coop-empty">{error}</div>;
  if (!vo) return null;

  const isReceived = vo.direction === "received";
  const isSent = vo.direction === "sent";
  const canCancel = isSent && vo.status === "요청";
  const canRerequest = isSent && (vo.status === "거절" || vo.status === "만료");
  // 채팅은 "수락된 상태" + "요청자 본인이거나, 내가 그 수락한 의사인 경우"만 가능.
  // 이름은 이제 항상 실명으로 보이므로, "내가 수락자인지"는 별도 필드(viewerIsAcceptDoctor)로 판단한다.
  const canChat = vo.status === "수락" && (isSent || vo.viewerIsAcceptDoctor);

  return (
    <div className="coop-page mb-5">
      <div className="coop-header">
        <h3 className="coop-title">협진 요청 상세</h3>
        <span className={"coop-pill status-" + (vo.displayStatus || vo.status)}>
          {vo.displayStatus || vo.status}
        </span>
      </div>

      <div className="coop-view-card">
        <div className="coop-detail-section-title">협진 요청</div>
        <div className="coop-view-grid">
          <div>
            <span className="coop-view-label">요청 의사</span>
            <span className="coop-view-value">{renderDoctor(vo.reqDoctorName, vo.reqDoctorMeta, vo.reqDoctorId)}</span>
          </div>
          <div>
            <span className="coop-view-label">수신 대상</span>
            <span className="coop-view-value">
              {vo.recvType === "지정의사" ? (
                renderDoctor(vo.recvDoctorName, vo.recvDoctorMeta, vo.recvDoctorId)
              ) : (
                <>
                  {vo.recvDeptName || `진료과 #${vo.recvDeptId}`}
                  {vo.acceptDoctorId ? (
                    <>
                      {" → "}
                      {renderDoctor(vo.acceptDoctorName, vo.acceptDoctorMeta, vo.acceptDoctorId)}
                      {" (수락)"}
                    </>
                  ) : (
                    " (아직 미수락)"
                  )}
                </>
              )}
            </span>
          </div>
          <div>
            <span className="coop-view-label">요청 시각</span>
            <span className="coop-view-value">{vo.reqTime}</span>
          </div>
          {vo.respTime && (
            <div>
              <span className="coop-view-label">응답 시각</span>
              <span className="coop-view-value">{vo.respTime}</span>
            </div>
          )}
          <div className="coop-view-span2">
            <span className="coop-view-label">요청 내용</span>
            <span className="coop-view-value">{vo.reqContent}</span>
          </div>
          {vo.originRequestId && vo.originReqContent && (
            <div className="coop-view-span2">
              <span className="coop-view-label">이전 요청 내용</span>
              <span className="coop-view-value">
                "{vo.originReqContent}"
                {vo.originReqTime && <span style={{ color: "var(--coop-faint)" }}> ({vo.originReqTime})</span>}
              </span>
            </div>
          )}
          {vo.rejectReason && (
            <div className="coop-view-span2">
              <span className="coop-view-label">거절 사유</span>
              <span className="coop-view-value coop-view-danger">{vo.rejectReason}</span>
            </div>
          )}
        </div>
      </div>

      {vo.pacsStudyId && <CoopStudyDetailPanel pacsStudyId={vo.pacsStudyId} />}
      {vo.pacsStudyId && <CoopStudyImageViewer pacsStudyId={vo.pacsStudyId} />}

      {isSent && vo.recvType === "진료과" && vo.deptRejections && vo.deptRejections.length > 0 && (
        <div className="coop-dept-reject-box">
          <div className="coop-quote-label">진료과 개인별 거절 내역</div>
          {vo.deptRejections.map((r, i) => (
            <div key={i} className="coop-dept-reject-item">
              <span className="coop-dept-reject-doctor">{r.doctorName || `의사 #${r.doctorId}`}</span>
              <span className="coop-dept-reject-reason">"{r.rejectReason}"</span>
              <span className="coop-dept-reject-time">{r.rejectedAt}</span>
            </div>
          ))}
        </div>
      )}

      {actionError && <div className="coop-form-error">{actionError}</div>}

      <div className="coop-form-actions">
        <button type="button" className="btn-coop-reset" onClick={() => navigate(-1)}>
          목록으로
        </button>

        {isReceived && vo.canRespond && (
          <>
            <button
              type="button"
              className="btn-coop-danger"
              onClick={() => setModal(vo.recvType === "진료과" ? "deptReject" : "reject")}
              disabled={processing}
            >
              거절
            </button>
            <button type="button" className="btn-coop-apply" onClick={handleAccept} disabled={processing}>
              수락
            </button>
          </>
        )}

        {canCancel && (
          <button type="button" className="btn-coop-danger" onClick={handleCancel} disabled={processing}>
            요청 취소
          </button>
        )}

        {canRerequest && (
          <button
            type="button"
            className="btn-coop-apply"
            onClick={() => navigate(`/coop/write?originRequestId=${vo.coopRequestId}`)}
          >
            재요청
          </button>
        )}

        {canChat && (
          <button type="button" className="btn-coop-apply" onClick={() => setChatOpen((v) => !v)}>
            {chatOpen ? "채팅 닫기" : "채팅"}
          </button>
        )}
      </div>

      {canChat && chatOpen && <CoopChatPanel coopRequestId={vo.coopRequestId} />}

      {modal === "reject" && (
        <CoopReasonModal
          title="협진 요청 거절"
          submitLabel="거절"
          submitting={processing}
          onSubmit={handleReject}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "deptReject" && (
        <CoopReasonModal
          title="협진 요청 거절 (진료과)"
          submitLabel="거절"
          submitting={processing}
          onSubmit={handleDeptReject}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default CoopRequestView;