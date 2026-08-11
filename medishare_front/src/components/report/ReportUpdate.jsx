import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../common/api";

function ReportUpdate() {
  const { no } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  useEffect(() => { api.get(`/report/view.do/${no}`).then((response) => setReport(response.data)).catch(() => alert("소견서를 불러오지 못했습니다.")); }, [no]);
  if (!report) return <p className="mt-5">불러오는 중입니다.</p>;
  const change = (event) => setReport({ ...report, [event.target.name]: event.target.value });
  const update = async (event) => {
    event.preventDefault();
    try { await api.put(`/report/update.do/${no}`, report); alert("수정했습니다."); navigate(`/report/view/${no}`); }
    catch (error) { alert(error.response?.data?.message || "수정에 실패했습니다."); }
  };
  return <section className="report-page"><h2 className="mb-4">판독소견서 수정</h2><form onSubmit={update} className="card card-body report-form"><div className="mb-3"><label className="form-label">PACS Study No</label><input className="form-control" value={report.studyNo} readOnly /></div><div className="mb-3"><label className="form-label">제목 *</label><input name="title" className="form-control" value={report.title} onChange={change} required /></div><div className="mb-3"><label className="form-label">소견 *</label><textarea name="findings" className="form-control" rows="7" value={report.findings} onChange={change} required /></div><div className="mb-3"><label className="form-label">결론</label><textarea name="impression" className="form-control" rows="4" value={report.impression || ""} onChange={change} /></div><div className="mb-4"><label className="form-label">상태</label><select name="status" className="form-select" value={report.status} onChange={change}><option value="DRAFT">임시저장</option><option value="FINAL">최종판독</option></select></div><button className="btn btn-primary align-self-start">수정</button></form></section>;
}

export default ReportUpdate;
