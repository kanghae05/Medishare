import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../common/api";
import ReportDelete from "./ReportDelete";

function ReportView() {
  const { no } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const login = useMemo(() => JSON.parse(localStorage.getItem("login") || "null"), []);
  useEffect(() => { api.get(`/report/view.do/${no}`).then((response) => setReport(response.data)).catch(() => alert("소견서를 불러오지 못했습니다.")); }, [no]);
  if (!report) return <p className="mt-5">불러오는 중입니다.</p>;
  const canManage = login && (login.sub === report.memberId || login.roles?.includes("ROLE_ADMIN"));
  return <section className="report-page"><div className="d-flex justify-content-between align-items-center mb-4"><div><h2>{report.title}</h2><span className={`badge ${report.status === "FINAL" ? "text-bg-success" : "text-bg-secondary"}`}>{report.status === "FINAL" ? "최종판독" : "임시저장"}</span></div><span className="text-muted">판독의: {report.memberName}</span></div><div className="card"><div className="card-body"><dl className="row mb-0"><dt className="col-sm-3">PACS Study No</dt><dd className="col-sm-9">{report.studyNo}</dd><dt className="col-sm-3">소견</dt><dd className="col-sm-9 report-text">{report.findings}</dd><dt className="col-sm-3">결론</dt><dd className="col-sm-9 report-text">{report.impression || "-"}</dd></dl></div></div><div className="mt-4 d-flex gap-2"><Link className="btn btn-outline-secondary" to={`/report/list?studyNo=${report.studyNo}`}>목록</Link>{canManage && <><Link className="btn btn-primary" to={`/report/update/${no}`}>수정</Link><button className="btn btn-danger" onClick={() => setShowDelete(!showDelete)}>삭제</button></>}</div>{showDelete && <ReportDelete no={no} studyNo={report.studyNo} onDeleted={(studyNo) => navigate(`/report/list?studyNo=${studyNo}`)} onCancel={() => setShowDelete(false)} />}</section>;
}

export default ReportView;
