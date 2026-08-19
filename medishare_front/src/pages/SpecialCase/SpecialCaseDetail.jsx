import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import WatermarkOverlay from "../../components/SpecialCase/WatermarkOverlay";
import { deleteSpecialCase, getSpecialCase } from "./specialCaseApi";
import "./SpecialCase.css";

export default function SpecialCaseDetail({ currentUser }) {
  const { caseId } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSpecialCase(caseId).then(setItem);
  }, [caseId]);

  if (!item) {
    return (
      <div className="case-shell">
        <div className="case-state">특이케이스를 불러오는 중입니다.</div>
      </div>
    );
  }

  const isAdmin = currentUser?.roles?.some((role) => role === "ADMIN" || role === "ROLE_ADMIN") ?? false;
  const isOwner = String(currentUser?.memberId ?? currentUser?.id) === String(item.writerId);
  const canDelete = isOwner || isAdmin;
  const viewerUrl = item.studyInstanceUid
    ? `http://${window.location.hostname}:3000/viewer?StudyInstanceUIDs=${encodeURIComponent(item.studyInstanceUid)}`
    : "";

  // 삭제 처리 함수
  const remove = async () => {
    if (!window.confirm("특이케이스를 삭제하시겠습니까?")) return;
    await deleteSpecialCase(caseId);
    navigate("/special-cases");
  };

  return (
    <div className="case-shell">
      <article className="case-page case-detail">
        {/* 우측 상단 고정 단일 워터마크 */}
        <WatermarkOverlay user={currentUser} />

        {/* 헤더 영역 (모달리티/부위 배지, 제목, 작성자 및 조회수) */}
        <header className="case-detail-head">
          <div className="case-badges">
            <span>{item.modality}</span>
            <span>{item.bodyPart}</span>
          </div>
          <h1>{item.title}</h1>
          <div className="case-detail-meta">
            <span>작성자: <strong>{item.writerName || item.writer || item.writerId || "관리자"}</strong></span>
            <span className="case-meta-divider"></span>
            <p>조회 {item.views ?? 0}</p>
          </div>
        </header>

        {/* 상세 소견 영역 (Findings, Impression, 태그) */}
        <section className="case-detail-card">
          <div>
            <h2>Findings</h2>
            <p>{item.findings}</p>
          </div>
          <div>
            <h2>Impression</h2>
            <p>{item.impression}</p>
          </div>
          {item.tags?.length > 0 && (
            <div className="case-tags">
              {item.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}
        </section>

        {viewerUrl && (
          <section className="case-pacs-section">
            <div className="case-pacs-head">
              <div>
                <strong>PACS DICOM 영상</strong>
                <span>연결된 검사를 OHIF Viewer로 표시합니다.</span>
              </div>
              <a className="case-secondary" href={viewerUrl} target="_blank" rel="noreferrer">
                새 창에서 보기
              </a>
            </div>
            <div className="case-viewer">
              <iframe src={viewerUrl} title={`${item.title} PACS DICOM Viewer`} allowFullScreen />
            </div>
          </section>
        )}

        {/* 하단 버튼 영역 (목록, 수정, 삭제) */}
        <div className="case-actions">
          <Link className="case-secondary" to="/special-cases">
            목록
          </Link>
          {isOwner && (
            <Link className="case-secondary" to={`/special-cases/${caseId}/edit`}>
              수정
            </Link>
          )}
          {canDelete && (
            <button className="case-danger" onClick={remove}>
              삭제
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
