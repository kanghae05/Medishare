import { useState } from "react";
import api from "../common/api";

function ReportDelete({ no, studyNo, onDeleted, onCancel }) {
  const [changeReason, setChangeReason] = useState("");
  const remove = async () => {
    try {
      await api.delete(`/report/delete.do/${no}`, { params: changeReason.trim() ? { changeReason: changeReason.trim() } : {} });
      alert("판독소견서를 삭제했습니다.");
      onDeleted(studyNo);
    } catch (error) {
      alert(error.response?.data?.message || "삭제 권한이 없거나 삭제에 실패했습니다.");
    }
  };

  return <div className="card border-danger mt-3"><div className="card-body">
    <p className="mb-3">이 판독소견서를 삭제할까요? 삭제된 데이터는 복구할 수 없습니다.</p>
    <label className="form-label">변경 사유</label>
    <input className="form-control mb-3" maxLength="500" value={changeReason} onChange={(event) => setChangeReason(event.target.value)} />
    <button className="btn btn-danger me-2" onClick={remove}>삭제 확인</button><button className="btn btn-outline-secondary" onClick={onCancel}>취소</button>
  </div></div>;
}

export default ReportDelete;
