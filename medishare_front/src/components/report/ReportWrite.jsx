import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import "./Report.css";

const EMPTY_CONTENT = { title: "", findings: "", impression: "", status: "DRAFT" };

function ReportWrite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [studies, setStudies] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [draftNo, setDraftNo] = useState(null);
  const [draftNotice, setDraftNotice] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [report, setReport] = useState({ studyNo: searchParams.get("studyNo") || "", ...EMPTY_CONTENT });
  const login = useMemo(() => JSON.parse(localStorage.getItem("login") || "null"), []);

  const selectedStudy = useMemo(() => studies.find((study) => String(study.no) === String(report.studyNo)), [studies, report.studyNo]);

  useEffect(() => {
    api.get("/pacs/list.do").then((response) => setStudies(response.data))
      .catch(() => alert("PACS 검사 목록을 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    if (!selectedStudy?.orthancStudyId) { setPreviewUrl(""); setPreviewError(""); return undefined; }
    let objectUrl = "";
    setPreviewError("");
    api.get(`/pacs/thumbnail/${encodeURIComponent(selectedStudy.orthancStudyId)}`, { responseType: "blob" })
      .then((response) => { objectUrl = URL.createObjectURL(response.data); setPreviewUrl(objectUrl); })
      .catch(() => { setPreviewUrl(""); setPreviewError("이 검사에 표시할 영상 미리보기가 없습니다."); });
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [selectedStudy?.orthancStudyId]);

  useEffect(() => {
    if (!selectedStudy?.no || !login?.sub) return undefined;
    let cancelled = false;
    setDraftNo(null);
    setDraftLoading(true);
    setDraftNotice("임시저장 소견서를 확인하는 중입니다.");
    api.get("/report/list.do", { params: { studyNo: selectedStudy.no, status: "DRAFT" } })
      .then((response) => {
        if (cancelled) return;
        const myDraft = response.data.find((item) => item.memberId === login.sub);
        if (!myDraft) { setDraftNotice("이 검사에 내가 임시저장한 소견서가 없습니다. 새로 작성할 수 있습니다."); return; }
        setDraftNo(myDraft.no);
        setReport({ studyNo: String(selectedStudy.no), title: myDraft.title, findings: myDraft.findings, impression: myDraft.impression || "", status: "DRAFT" });
        setDraftNotice("이 검사에 임시저장한 소견서를 자동으로 불러왔습니다. 계속 작성한 뒤 등록하세요.");
      })
      .catch(() => { if (!cancelled) setDraftNotice("임시저장 소견서를 확인하지 못했습니다."); })
      .finally(() => { if (!cancelled) setDraftLoading(false); });
    return () => { cancelled = true; };
  }, [selectedStudy?.no, login?.sub]);

  const change = (event) => {
    const { name, value } = event.target;
    if (name === "studyNo") { setDraftNo(null); setDraftNotice(""); setDraftLoading(false); setReport({ studyNo: value, ...EMPTY_CONTENT }); return; }
    setReport((current) => ({ ...current, [name]: value }));
  };

  const openViewer = () => {
    if (!selectedStudy?.studyInstanceUID) {
      alert("이 검사에는 OHIF Viewer를 열 수 있는 Study UID가 없습니다.");
      return;
    }
    const viewerUrl = `http://${window.location.hostname}:3000/viewer?StudyInstanceUIDs=${encodeURIComponent(selectedStudy.studyInstanceUID)}`;
    window.open(viewerUrl, "_blank", "noopener,noreferrer");
  };

  const write = async (event) => {
    event.preventDefault();
    const payload = { ...report, studyNo: Number(report.studyNo) };
    try {
      const response = draftNo ? await api.put(`/report/update.do/${draftNo}`, payload) : await api.post("/report/write.do", payload);
      alert(report.status === "FINAL" ? "최종판독으로 등록했습니다." : "임시저장했습니다.");
      navigate(`/report/view/${response.data.no}`);
    } catch (error) { alert(error.response?.data?.message || "소견서 등록에 실패했습니다."); }
  };

  return <section className="report-page"><h2 className="mb-4">판독소견서 작성</h2><form onSubmit={write} className="card card-body report-form">
    <div className="mb-3"><label className="form-label">PACS 검사 선택 *</label><select name="studyNo" className="form-select" value={report.studyNo} onChange={change} required><option value="">검사를 선택하세요</option>{studies.map((study) => <option key={study.no} value={study.no}>[{study.no}] {study.patientName || "환자 정보 없음"} · {study.studyDescription || "검사 설명 없음"}</option>)}</select></div>
    {draftNotice && <div className={`alert ${draftNo ? "alert-success" : "alert-info"} py-2`} role="status">{draftLoading ? "임시저장 소견서를 확인하는 중입니다." : draftNotice}</div>}
    {selectedStudy && <div className="report-study-preview mb-4"><div className="report-study-meta"><strong>{selectedStudy.patientName || "환자 정보 없음"}</strong><span>{selectedStudy.studyDescription || "검사 설명 없음"}</span><button type="button" className="btn btn-sm btn-outline-primary ms-auto" onClick={openViewer}>전체 영상 보기</button></div><div className="report-image-frame">{previewUrl ? <img src={previewUrl} alt="선택한 PACS 검사 영상 미리보기" /> : <p>{previewError || "의료영상 미리보기를 불러오는 중입니다."}</p>}</div></div>}
    <div className="mb-3"><label className="form-label">제목 *</label><input name="title" className="form-control" value={report.title} onChange={change} maxLength="200" required /></div><div className="mb-3"><label className="form-label">소견 *</label><textarea name="findings" className="form-control" rows="7" value={report.findings} onChange={change} required /></div><div className="mb-3"><label className="form-label">결론</label><textarea name="impression" className="form-control" rows="4" value={report.impression} onChange={change} /></div><div className="mb-4"><label className="form-label">상태 *</label><select name="status" className="form-select" value={report.status} onChange={change}><option value="DRAFT">임시저장</option><option value="FINAL">최종판독</option></select></div><button className="btn btn-primary align-self-start">{draftNo ? "임시저장 소견서 수정" : "등록"}</button>
  </form></section>;
}

export default ReportWrite;
