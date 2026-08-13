import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import WatermarkOverlay from "../../components/SpecialCase/WatermarkOverlay";
import { deleteSpecialCase, getSpecialCase } from "./specialCaseApi";
import "./SpecialCase.css";

export default function SpecialCaseDetail({ currentUser }) {
  const { caseId } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { getSpecialCase(caseId).then(setItem); }, [caseId]);
  if (!item) return <div className="case-shell"><div className="case-state">특이케이스를 불러오는 중입니다.</div></div>;

  const mine = String(currentUser?.id) === String(item.writerId);
  const remove = async () => { if (!window.confirm("특이케이스를 삭제하시겠습니까?")) return; await deleteSpecialCase(caseId); navigate("/special-cases"); };

  return (
    <div className="case-shell"><article className="case-page case-detail">
      <WatermarkOverlay user={currentUser} />
      <header className="case-detail-head"><div className="case-badges"><span>{item.modality}</span><span>{item.bodyPart}</span></div><h1>{item.title}</h1><p>조회 {item.views ?? 0}</p></header>
      <section className="case-detail-card"><div><h2>Findings</h2><p>{item.findings}</p></div><div><h2>Impression</h2><p>{item.impression}</p></div>{item.tags?.length > 0 && <div className="case-tags">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}</section>
      {item.studyInstanceUid && <div className="case-viewer"><iframe title="PACS DICOM Viewer" src={`/pacs/viewer?studyUID=${encodeURIComponent(item.studyInstanceUid)}`} /><WatermarkOverlay user={currentUser} /></div>}
      <div className="case-actions"><Link className="case-secondary" to="/special-cases">목록</Link>{mine && <Link className="case-secondary" to={`/special-cases/${caseId}/edit`}>수정</Link>}{mine && <button className="case-danger" onClick={remove}>삭제</button>}</div>
    </article></div>
  );
}
