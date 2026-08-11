import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function ReportWrite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [report, setReport] = useState({ studyNo: searchParams.get("studyNo") || "", title: "", findings: "", impression: "", status: "DRAFT" });
  const change = (event) => setReport({ ...report, [event.target.name]: event.target.value });
  const write = async (event) => {
    event.preventDefault();
    try { const response = await api.post("/report/write.do", { ...report, studyNo: Number(report.studyNo) }); alert("등록했습니다."); navigate(`/report/view/${response.data.no}`); }
    catch (error) { alert(error.response?.data?.message || "등록에 실패했습니다."); }
  };
  return <section className="report-page"><h2 className="mb-4">판독소견서 작성</h2><form onSubmit={write} className="card card-body report-form"><div className="mb-3"><label className="form-label">PACS Study No *</label><input name="studyNo" type="number" min="1" className="form-control" value={report.studyNo} onChange={change} required /></div><div className="mb-3"><label className="form-label">제목 *</label><input name="title" className="form-control" value={report.title} onChange={change} maxLength="200" required /></div><div className="mb-3"><label className="form-label">소견 *</label><textarea name="findings" className="form-control" rows="7" value={report.findings} onChange={change} required /></div><div className="mb-3"><label className="form-label">결론</label><textarea name="impression" className="form-control" rows="4" value={report.impression} onChange={change} /></div><div className="mb-4"><label className="form-label">상태 *</label><select name="status" className="form-select" value={report.status} onChange={change}><option value="DRAFT">임시저장</option><option value="FINAL">최종판독</option></select></div><button className="btn btn-primary align-self-start">등록</button></form></section>;
}

export default ReportWrite;
