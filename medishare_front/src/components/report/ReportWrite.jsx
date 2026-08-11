import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";

function ReportWrite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [studies, setStudies] = useState([]);
  const [report, setReport] = useState({ studyNo: searchParams.get("studyNo") || "", title: "", findings: "", impression: "", status: "DRAFT" });

  useEffect(() => {
    api.get("/pacs/list.do")
      .then((response) => setStudies(response.data))
      .catch(() => alert("PACS 검사 목록을 불러오지 못했습니다."));
  }, []);

  const change = (event) => setReport({ ...report, [event.target.name]: event.target.value });
  const write = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/report/write.do", { ...report, studyNo: Number(report.studyNo) });
      alert("판독소견서를 등록했습니다.");
      navigate(`/report/view/${response.data.no}`);
    } catch (error) {
      alert(error.response?.data?.message || "등록에 실패했습니다.");
    }
  };

  return <section className="report-page"><h2 className="mb-4">판독소견서 작성</h2><form onSubmit={write} className="card card-body report-form"><div className="mb-4"><label className="form-label">PACS 검사 선택 *</label><select name="studyNo" className="form-select" value={report.studyNo} onChange={change} required><option value="">검사를 선택하세요</option>{studies.map((study) => <option key={study.no} value={study.no}>[{study.no}] {study.patientName || "환자 정보 없음"} · {study.studyDate || "날짜 없음"} · {study.studyDescription || "검사 설명 없음"}</option>)}</select><div className="form-text">PACS에서 동기화된 검사만 선택할 수 있습니다.</div></div><div className="mb-3"><label className="form-label">제목 *</label><input name="title" className="form-control" value={report.title} onChange={change} maxLength="200" required /></div><div className="mb-3"><label className="form-label">소견 *</label><textarea name="findings" className="form-control" rows="7" value={report.findings} onChange={change} required /></div><div className="mb-3"><label className="form-label">결론</label><textarea name="impression" className="form-control" rows="4" value={report.impression} onChange={change} /></div><div className="mb-4"><label className="form-label">상태 *</label><select name="status" className="form-select" value={report.status} onChange={change}><option value="DRAFT">임시저장</option><option value="FINAL">최종판독</option></select></div><button className="btn btn-primary align-self-start">등록</button></form></section>;
}

export default ReportWrite;
