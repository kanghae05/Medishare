import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../common/api";
import ReportDelete from "./ReportDelete";
import "./Report.css";

function ReportView() {
  const { no } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [study, setStudy] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const login = useMemo(() => JSON.parse(localStorage.getItem("login") || "null"), []);

  useEffect(() => {
    api.get(`/report/view.do/${no}`)
      .then((response) => setReport(response.data))
      .catch(() => alert("판독소견서를 불러오지 못했습니다."));
  }, [no]);

  useEffect(() => {
    if (!report?.studyNo) return;
    api.get("/pacs/list.do")
      .then((response) => setStudy(response.data.find((item) => String(item.no) === String(report.studyNo)) || null))
      .catch(() => setStudy(null));
  }, [report?.studyNo]);

  useEffect(() => {
    if (!study?.orthancStudyId) {
      setPreviewUrl("");
      setPreviewError("이 검사에 표시할 영상 미리보기가 없습니다.");
      return undefined;
    }

    let objectUrl = "";
    setPreviewError("");
    api.get(`/pacs/thumbnail/${encodeURIComponent(study.orthancStudyId)}`, { responseType: "blob" })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        setPreviewUrl("");
        setPreviewError("이 검사에 표시할 영상 미리보기가 없습니다.");
      });
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [study?.orthancStudyId]);

  if (!report) return <p className="mt-5">불러오는 중입니다.</p>;

  const canManage = login && (login.sub === report.memberId || login.roles?.includes("ROLE_ADMIN"));
  const openViewer = () => {
    if (!study?.studyInstanceUID) {
      alert("이 검사에는 OHIF Viewer를 열 수 있는 Study UID가 없습니다.");
      return;
    }
    const viewerUrl = `http://${window.location.hostname}:3000/viewer?StudyInstanceUIDs=${encodeURIComponent(study.studyInstanceUID)}`;
    window.open(viewerUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <section className="report-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h2>{report.title}</h2><span className={`badge ${report.status === "FINAL" ? "text-bg-success" : "text-bg-secondary"}`}>{report.status === "FINAL" ? "최종판독" : "임시저장"}</span></div>
        <span className="text-muted">판독의: {report.memberName}</span>
      </div>
      <div className="card"><div className="card-body"><dl className="row mb-0">
        <dt className="col-sm-3">PACS Study No</dt><dd className="col-sm-9">{report.studyNo}</dd>
        <dt className="col-sm-3">소견</dt><dd className="col-sm-9 report-text">{report.findings}</dd>
        <dt className="col-sm-3">결론</dt><dd className="col-sm-9 report-text">{report.impression || "-"}</dd>
      </dl></div></div>
      <div className="report-study-preview mt-4">
        <div className="report-study-meta"><strong>{study?.patientName || "PACS 검사 영상"}</strong><span>{study?.studyDescription || `Study No: ${report.studyNo}`}</span><button type="button" className="btn btn-sm btn-outline-primary ms-auto" onClick={openViewer}>전체 영상 보기</button></div>
        <div className="report-image-frame">{previewUrl ? <img src={previewUrl} alt="판독 대상 PACS 검사 영상 미리보기" /> : <p>{previewError || "의료영상 미리보기를 불러오는 중입니다."}</p>}</div>
      </div>
      <div className="mt-4 d-flex gap-2">
        <Link className="btn btn-outline-secondary" to={`/report/list?studyNo=${report.studyNo}`}>목록</Link>
        {canManage && <><Link className="btn btn-primary" to={`/report/update/${no}`}>수정</Link><button className="btn btn-danger" onClick={() => setShowDelete(!showDelete)}>삭제</button></>}
      </div>
      {showDelete && <ReportDelete no={no} studyNo={report.studyNo} onDeleted={(studyNo) => navigate(`/report/list?studyNo=${studyNo}`)} onCancel={() => setShowDelete(false)} />}
    </section>
  );
}

export default ReportView;
