import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import "./Report.css";

function ReportList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [studies, setStudies] = useState([]);
  const [studyNo, setStudyNo] = useState(searchParams.get("studyNo") || "");
  const [status, setStatus] = useState("FINAL");
  const [reports, setReports] = useState([]);
  const [searched, setSearched] = useState(false);
  const [keywordType, setKeywordType] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    api.get("/pacs/list.do")
      .then((response) => setStudies(response.data))
      .catch(() => alert("PACS 검사 목록을 불러오지 못했습니다."));
  }, []);

  const studyByNo = useMemo(
    () => new Map(studies.map((study) => [String(study.no), study])),
    [studies]
  );

  const filteredReports = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return reports.filter((report) => {
      const study = studyByNo.get(String(report.studyNo));
      const patientName = study?.patientName || "";
      const reportTitle = report.title || "";
      const readerName = report.memberName || "";
      const matchesKeyword = !normalizedKeyword || {
        ALL: `${patientName} ${reportTitle} ${readerName}`,
        PATIENT: patientName,
        TITLE: reportTitle,
        READER: readerName,
      }[keywordType].toLowerCase().includes(normalizedKeyword);
      return matchesKeyword;
    });
  }, [reports, studyByNo, keyword, keywordType]);

  const loadReports = async (nextStatus) => {
    try {
      const params = { status: nextStatus };
      if (studyNo) params.studyNo = studyNo;
      const response = await api.get("/report/list.do", { params });
      setReports(response.data);
      setStatus(nextStatus);
      setSearched(true);
    } catch (error) {
      alert(error.response?.data?.message || "판독소견서 목록을 불러오지 못했습니다.");
    }
  };

  const search = (event) => { event.preventDefault(); loadReports(status); };
  const resetFilter = () => { setStudyNo(""); setKeywordType("ALL"); setKeyword(""); setSearched(false); setReports([]); };
  const currentLabel = status === "DRAFT" ? "임시저장" : "최종판독";

  return (
    <section className="report-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h2>판독소견서</h2><p className="text-muted mb-0">환자명, 판독의, 제목으로 판독소견서를 검색합니다.</p></div>
        <Link to={`/report/write${studyNo ? `?studyNo=${studyNo}` : ""}`} className="btn btn-primary">소견서 작성</Link>
      </div>
      <form className="card card-body mb-3" onSubmit={search}>
        <div className="row g-2">
          <div className="col-md-6"><label className="form-label">PACS 검사</label><select className="form-select" value={studyNo} onChange={(event) => { setStudyNo(event.target.value); setSearched(false); }}><option value="">전체 검사</option>{studies.map((study) => <option key={study.no} value={study.no}>[{study.no}] {study.patientName || "환자 정보 없음"} · {study.studyDescription || "검사 설명 없음"}</option>)}</select></div>
          <div className="col-md-2"><label className="form-label">검색 구분</label><select className="form-select" value={keywordType} onChange={(event) => setKeywordType(event.target.value)}><option value="ALL">전체</option><option value="PATIENT">환자명</option><option value="TITLE">제목</option><option value="READER">판독의</option></select></div>
          <div className="col-md-4"><label className="form-label">검색어</label><input className="form-control" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="검색어 입력" /></div>
        </div>
        <div className="d-flex gap-2 mt-3"><button className="btn btn-outline-primary">조회</button><button type="button" className="btn btn-outline-secondary" onClick={resetFilter}>초기화</button></div>
      </form>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{currentLabel} 소견서 {searched && <small className="text-muted">({filteredReports.length}건)</small>}</h5>
        <div className="btn-group"><button type="button" className={`btn ${status === "FINAL" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => loadReports("FINAL")}>최종판독 보기</button><button type="button" className={`btn ${status === "DRAFT" ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => loadReports("DRAFT")}>임시저장 보기</button></div>
      </div>
      <div className="card"><div className="table-responsive"><table className="table table-hover mb-0">
        <thead><tr><th>번호</th><th>환자명</th><th>제목</th><th>상태</th><th>판독의</th><th>작성일</th></tr></thead>
        <tbody>{filteredReports.length === 0 ? <tr><td colSpan="6" className="text-center py-4">{searched ? `${currentLabel} 소견서 검색 결과가 없습니다.` : "전체 또는 특정 검사를 선택한 뒤 조회하세요."}</td></tr> : filteredReports.map((report) => { const study = studyByNo.get(String(report.studyNo)); return <tr className="report-row" key={report.no} onClick={() => navigate(`/report/view/${report.no}`)}><td>{report.no}</td><td>{study?.patientName || "-"}</td><td>{report.title}</td><td>{report.status === "DRAFT" ? "임시저장" : "최종판독"}</td><td>{report.memberName}</td><td>{report.writeDate?.replace("T", " ").slice(0, 16)}</td></tr>; })}</tbody>
      </table></div></div>
    </section>
  );
}

export default ReportList;
