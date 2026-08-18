import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReportSelectModal from "../../components/SpecialCase/ReportSelectModal";
import { getSpecialCase, saveSpecialCase } from "./specialCaseApi";
import "./SpecialCase.css";

const EMPTY_FORM = { title: "", modality: "", bodyPart: "", diseaseCode: "", findings: "", impression: "", thumbnailUrl: "", studyInstanceUid: "", seriesInstanceUid: "", patientName: "", patientId: "", tags: "" };

export default function SpecialCaseCreate() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [modal, setModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { if (caseId) getSpecialCase(caseId).then((item) => setForm({ ...item, tags: item.tags.join(", "), patientId: "" })); }, [caseId]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const selectReport = (report) => {
    setSelectedReportId(report.reportId);
    setForm((current) => ({
      ...current,
      title: current.title || report.title || "",
      ...Object.fromEntries(["studyInstanceUid", "seriesInstanceUid", "findings", "impression", "modality", "bodyPart", "patientName", "patientId"].map((key) => [key, report[key] ?? current[key]])),
    }));
  };
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const saved = await saveSpecialCase(caseId, { ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) });
      navigate(`/special-cases/${saved.caseId}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "특이케이스를 저장하지 못했습니다.");
    }
  };

  return <div className="case-shell"><section className="case-page">
    <header className="case-page-head"><div><h1>특이케이스 {caseId ? "수정" : "등록"}</h1><p>판독 정보를 바탕으로 공유할 임상 사례를 작성하세요.</p></div><button type="button" className="case-secondary" onClick={() => setModal(true)}>판독 소견 불러오기</button></header>
    <form className="case-form-card" onSubmit={submit}>
      {selectedReportId && <div className="alert alert-success case-full mb-0">판독소견서 #{selectedReportId}의 PACS 정보를 불러왔습니다.</div>}
      {error && <div className="alert alert-danger case-full mb-0" role="alert">{error}</div>}
      <label className="case-full"><span>제목</span><input required name="title" placeholder="케이스 제목을 입력하세요" value={form.title} onChange={change} /></label>
      <label><span>검사 종류</span><input required name="modality" placeholder="예: CT, MRI" value={form.modality} onChange={change} /></label><label><span>촬영 부위</span><input required name="bodyPart" placeholder="예: Brain, Chest" value={form.bodyPart} onChange={change} /></label><label><span>질병 코드</span><input name="diseaseCode" placeholder="질병 코드" value={form.diseaseCode ?? ""} onChange={change} /></label>
      <label className="case-full"><span>Findings</span><textarea required rows="7" name="findings" placeholder="영상 소견을 입력하세요" value={form.findings} onChange={change} /></label><label className="case-full"><span>Impression</span><textarea required rows="5" name="impression" placeholder="판독 결론을 입력하세요" value={form.impression} onChange={change} /></label>
      <label className="case-full"><span>Study Instance UID</span><input required name="studyInstanceUid" value={form.studyInstanceUid ?? ""} onChange={change} /></label><label className="case-full"><span>태그</span><input name="tags" placeholder="쉼표로 구분해 입력하세요" value={form.tags} onChange={change} /></label>
      <div className="case-actions case-full"><Link className="case-secondary" to={caseId ? `/special-cases/${caseId}` : "/special-cases"}>취소</Link><button className="case-primary">저장</button></div>
    </form><ReportSelectModal open={modal} onClose={() => setModal(false)} onSelect={selectReport} />
  </section></div>;
}
