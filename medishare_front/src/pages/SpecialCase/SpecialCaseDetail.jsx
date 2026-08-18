import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import WatermarkOverlay from "../../components/SpecialCase/WatermarkOverlay";
import { deleteSpecialCase, getSpecialCase, getSpecialCasePreview } from "./specialCaseApi";
import "./SpecialCase.css";

export default function SpecialCaseDetail({ currentUser }) {
  const { caseId } = useParams();
  const [item, setItem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSpecialCase(caseId).then(setItem);
  }, [caseId]);

  useEffect(() => {
    let objectUrl;

    getSpecialCasePreview(caseId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => setPreviewError(true));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [caseId]);

  if (!item) {
    return (
      <div className="case-shell">
        <div className="case-state">특이케이스를 불러오는 중입니다.</div>
      </div>
    );
  }

  // 작성자 본인 또는 관리자 권한 확인
  const mine =
    currentUser?.roles?.some((role) => role === "ADMIN" || role === "ROLE_ADMIN") ||
    String(currentUser?.memberId ?? currentUser?.id) === String(item.writerId);

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

        {/* Orthanc 대표 이미지는 백엔드를 경유하므로 외부 PC에서도 localhost 문제없이 표시된다. */}
        {item.studyInstanceUid && (
          <div className="case-viewer">
            {previewUrl && <img className="case-preview" src={previewUrl} alt={`${item.title} 의료영상`} />}
            {!previewUrl && !previewError && <div className="case-viewer-state">의료영상을 불러오는 중입니다.</div>}
            {previewError && <div className="case-viewer-state">Orthanc 의료영상을 불러오지 못했습니다.</div>}
          </div>
        )}

        {/* 하단 버튼 영역 (목록, 수정, 삭제) */}
        <div className="case-actions">
          <Link className="case-secondary" to="/special-cases">
            목록
          </Link>
          {mine && (
            <Link className="case-secondary" to={`/special-cases/${caseId}/edit`}>
              수정
            </Link>
          )}
          {mine && (
            <button className="case-danger" onClick={remove}>
              삭제
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
