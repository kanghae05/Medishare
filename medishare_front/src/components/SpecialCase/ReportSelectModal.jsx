import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../common/api";

export default function ReportSelectModal({ open, onClose, onSelect }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    api.get("/api/reports")
      .then((response) => setReports(response.data))
      .catch((requestError) => setError(requestError.response?.data?.message || "판독소견서를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal d-block report-select-modal"
      style={{ background: "rgba(0, 0, 0, 0.53)", zIndex: 10000 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">판독소견서 선택</h5>
            <button type="button" className="btn-close" aria-label="닫기" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? <div className="text-center py-4">판독소견서를 불러오는 중입니다.</div> : reports.length === 0 ? (
              <div className="text-center text-muted py-4">등록 가능한 내 판독소견서가 없습니다.</div>
            ) : (
              <div className="list-group">
                {reports.map((report) => (
                  <button type="button" className="list-group-item list-group-item-action" key={report.reportId} onClick={() => { onSelect(report); onClose(); }}>
                    <div className="d-flex justify-content-between gap-3">
                      <strong>{report.title || `판독소견서 #${report.reportId}`}</strong>
                      <span className="badge text-bg-secondary">{report.status}</span>
                    </div>
                    <small className="text-muted">{report.modality || "장비 미상"} · {report.bodyPart || "촬영 부위 미상"} · {report.writerName || "작성자 미상"}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
