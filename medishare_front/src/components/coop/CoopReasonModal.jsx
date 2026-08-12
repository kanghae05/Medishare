// 거절 사유 입력 모달 (지정의사 거절 / 진료과 개인별 거절 공용)
// NoticeViewModal.jsx의 부트스트랩 모달 패턴을 그대로 재사용한다.
import { useState } from "react";

function CoopReasonModal({ title, submitLabel = "확인", submitting, onSubmit, onClose }) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const isInvalid = touched && !reason.trim();

  const handleSubmit = () => {
    if (!reason.trim()) {
      setTouched(true);
      return;
    }
    onSubmit(reason.trim());
  };

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title mb-0">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <textarea
              className={"coop-form-textarea" + (isInvalid ? " is-invalid" : "")}
              rows={4}
              placeholder="사유를 입력하세요."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
            {isInvalid && <div className="coop-modal-error">사유를 입력해주세요.</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-coop-reset" onClick={onClose} disabled={submitting}>
              취소
            </button>
            <button type="button" className="btn-coop-apply" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "처리 중..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoopReasonModal;