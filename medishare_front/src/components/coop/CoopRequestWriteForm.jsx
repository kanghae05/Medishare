import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import "./Coop.css";

// TODO: 의사/진료과/검사 선택은 지금 숫자 ID 직접 입력이다.
// 회원관리(의사·진료과 목록 API), PACS(검사 목록 API)가 준비되면
// <input type="number">를 <select>로 교체한다.
// 참고: 환자는 검사(pacsStudyId)를 통해 자동으로 연결되므로 별도 입력칸이 없다.

function CoopRequestWriteForm() {
  const [searchParams] = useSearchParams();
  const originRequestId = searchParams.get("originRequestId");
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(null); // 재요청일 때 원본 요청 정보 (인용 표시용)
  const [recvType, setRecvType] = useState("지정의사");
  const [recvDoctorId, setRecvDoctorId] = useState("");
  const [recvDeptId, setRecvDeptId] = useState("");
  const [pacsStudyId, setPacsStudyId] = useState("");
  const [reportId, setReportId] = useState("");
  const [reqContent, setReqContent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 재요청이면 원본 요청을 불러와 환자/검사/소견서를 자동 복사하고 인용문을 보여준다.
  useEffect(() => {
    if (!originRequestId) return;
    let ignore = false;
    api
      .get("/coop/view.do", { params: { no: originRequestId } })
      .then((res) => {
        if (ignore) return;
        const o = res.data;
        setOrigin(o);
        setPacsStudyId(o.pacsStudyId ?? "");
        setReportId(o.reportId ?? "");
      })
      .catch(() => {
        if (!ignore) setError("원본 협진 요청 정보를 불러오지 못했습니다.");
      });
    return () => {
      ignore = true;
    };
  }, [originRequestId]);

  const validate = () => {
    if (recvType === "지정의사" && !recvDoctorId) return "수신 의사를 입력해주세요.";
    if (recvType === "진료과" && !recvDeptId) return "수신 진료과를 입력해주세요.";
    if (!pacsStudyId) return "검사를 입력해주세요.";
    if (!reqContent.trim()) return "요청 내용을 입력해주세요.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      recvType,
      recvDoctorId: recvType === "지정의사" ? Number(recvDoctorId) : null,
      recvDeptId: recvType === "진료과" ? Number(recvDeptId) : null,
      pacsStudyId: Number(pacsStudyId),
      reportId: reportId ? Number(reportId) : null,
      reqContent,
      originRequestId: originRequestId ? Number(originRequestId) : null,
    };

    api
      .post("/coop/write.do", payload)
      .then(() => {
        navigate("/coop/sent");
      })
      .catch((err) => {
        const message =
          err.response?.data?.message || err.response?.data?.error || "협진 요청 등록에 실패했습니다.";
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="coop-page">
      <h3 className="coop-title" style={{ marginBottom: 20 }}>
        {originRequestId ? "협진 재요청" : "협진 요청 등록"}
      </h3>

      {origin && (
        <div className="coop-quote-box">
          <div className="coop-quote-label">기존 요청 내용 ({origin.reqTime})</div>
          <div className="coop-quote-content">"{origin.reqContent}"</div>
          {origin.rejectReason && (
            <div className="coop-quote-reason">거절 사유: "{origin.rejectReason}"</div>
          )}
        </div>
      )}

      <form className="coop-form" onSubmit={handleSubmit}>
        <div className="coop-form-row">
          <label className="coop-form-label">수신 대상</label>
          <div className="coop-chip-group">
            <button
              type="button"
              className={"coop-chip" + (recvType === "지정의사" ? " active" : "")}
              onClick={() => setRecvType("지정의사")}
            >
              지정의사
            </button>
            <button
              type="button"
              className={"coop-chip" + (recvType === "진료과" ? " active" : "")}
              onClick={() => setRecvType("진료과")}
            >
              진료과
            </button>
          </div>
        </div>

        {recvType === "지정의사" ? (
          <div className="coop-form-row">
            <label className="coop-form-label">수신 의사 ID</label>
            <input
              type="number"
              className="coop-form-input"
              value={recvDoctorId}
              onChange={(e) => setRecvDoctorId(e.target.value)}
              placeholder="예: 1"
            />
          </div>
        ) : (
          <div className="coop-form-row">
            <label className="coop-form-label">수신 진료과 ID</label>
            <input
              type="number"
              className="coop-form-input"
              value={recvDeptId}
              onChange={(e) => setRecvDeptId(e.target.value)}
              placeholder="예: 1"
            />
          </div>
        )}

        <div className="coop-form-row">
          <label className="coop-form-label">검사 ID</label>
          <input
            type="number"
            className="coop-form-input"
            value={pacsStudyId}
            onChange={(e) => setPacsStudyId(e.target.value)}
            disabled={!!originRequestId}
            placeholder="예: 1"
          />
        </div>

        <div className="coop-form-row">
          <label className="coop-form-label">소견서 ID</label>
          <input
            type="number"
            className="coop-form-input"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            disabled={!!originRequestId}
            placeholder="선택사항"
          />
        </div>

        <div className="coop-form-row align-top">
          <label className="coop-form-label">요청 내용</label>
          <textarea
            className="coop-form-textarea"
            rows={5}
            value={reqContent}
            onChange={(e) => setReqContent(e.target.value)}
            placeholder="협진 요청 내용을 입력하세요."
          />
        </div>

        {error && <div className="coop-form-error">{error}</div>}

        <div className="coop-form-actions">
          <button type="button" className="btn-coop-reset" onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit" className="btn-coop-apply" disabled={submitting}>
            {submitting ? "등록 중..." : originRequestId ? "재요청 보내기" : "요청 보내기"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CoopRequestWriteForm;