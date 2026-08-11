import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import "./Report.css";

function ReportList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [studies, setStudies] = useState([]);
  const [studyNo, setStudyNo] = useState(searchParams.get("studyNo") || "");
  const [reports, setReports] = useState([]);

  useEffect(() => { api.get("/pacs/list.do").then((response) => setStudies(response.data)).catch(() => alert("PACS 검사 목록을 불러오지 못했습니다.")); }, []);
  const search = async (event) => {
    event.preventDefault();
    try { const response = await api.get("/report/list.do", { params: { studyNo } }); setReports(response.data); }
    catch (error) { alert(error.response?.data?.message || "소견서 목록을 불러오지 못했습니다."); }
  };

  return <section className="report-page"><div className="d-flex justify-content-between align-items-center mb-4"><div><h2>판독소견서</h2><p className="text-muted mb-0">PACS 검사별 판독소견서를 조회합니다.</p></div><Link to={`/report/write${studyNo ? `?studyNo=${studyNo}` : ""}`} className="btn btn-primary">소견서 작성</Link></div><form className="card card-body mb-4" onSubmit={search}><label className="form-label">PACS 검사 선택 *</label><div className="input-group"><select className="form-select" value={studyNo} onChange={(event) => setStudyNo(event.target.value)} required><option value="">검사를 선택하세요</option>{studies.map((study) => <option key={study.no} value={study.no}>[{study.no}] {study.patientName || "환자 정보 없음"} · {study.studyDate || "날짜 없음"} · {study.studyDescription || "검사 설명 없음"}</option>)}</select><button className="btn btn-outline-primary">조회</button></div></form><div className="card"><div className="table-responsive"><table className="table table-hover mb-0"><thead><tr><th>번호</th><th>제목</th><th>상태</th><th>판독의</th><th>작성일</th></tr></thead><tbody>{reports.length === 0 ? <tr><td colSpan="5" className="text-center py-4">검사를 선택해 소견서를 조회하세요.</td></tr> : reports.map((report) => <tr className="report-row" key={report.no} onClick={() => navigate(`/report/view/${report.no}`)}><td>{report.no}</td><td>{report.title}</td><td>{report.status}</td><td>{report.memberName}</td><td>{report.writeDate?.replace("T", " ").slice(0, 16)}</td></tr>)}</tbody></table></div></div></section>;
}

export default ReportList;
