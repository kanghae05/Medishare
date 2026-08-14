import { useEffect, useState } from "react";
import api from "../common/api";
import "./Coop.css";

// <img src="...">는 커스텀 인증 헤더(X-AUTH-TOKEN)를 못 실어 보내므로,
// axios로 이미지를 blob으로 받아서 브라우저 메모리 URL로 변환해 사용한다.
function CoopStudyImageViewer({ pacsStudyId }) {
  const [totalCount, setTotalCount] = useState(null); // null = 아직 확인 전
  const [index, setIndex] = useState(0);
  const [seriesDescription, setSeriesDescription] = useState(null);
  const [modality, setModality] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [infoError, setInfoError] = useState(null);

  // 검사 정보(전체 이미지 수, 시리즈 설명) 조회
  useEffect(() => {
    if (!pacsStudyId) return;
    let ignore = false;
    api
      .get(`/coop/study/${pacsStudyId}/instances.do`)
      .then((res) => {
        if (ignore) return;
        setTotalCount(res.data.count || 0);
        setSeriesDescription(res.data.seriesDescription || null);
        setModality(res.data.modality || null);
        setIndex(0);
      })
      .catch(() => {
        if (!ignore) {
          setTotalCount(0);
          setInfoError("이미지 정보를 불러올 수 없습니다. (PACS 연동 미설정이거나 존재하지 않는 검사)");
        }
      });
    return () => {
      ignore = true;
    };
  }, [pacsStudyId]);

  // 현재 인덱스의 이미지를 blob으로 받아와서 표시.
  // 새 이미지가 도착하기 전까지는 imageUrl을 건드리지 않아 이전 이미지가 그대로 남아있는다.
  useEffect(() => {
    if (!pacsStudyId || !totalCount) return;
    let ignore = false;
    let objectUrl = null;

    api
      .get(`/coop/study/${pacsStudyId}/instance/${index}/preview.do`, { responseType: "blob" })
      .then((res) => {
        if (ignore) return;
        objectUrl = URL.createObjectURL(res.data);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        if (!ignore) setImageUrl(null);
      });

    return () => {
      ignore = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pacsStudyId, index, totalCount]);

  if (totalCount === null) {
    return <div className="coop-image-viewer-empty">이미지 정보 확인 중...</div>;
  }
  if (totalCount === 0) {
    return <div className="coop-image-viewer-empty">{infoError || "표시할 이미지가 없습니다."}</div>;
  }

  return (
    <div className="coop-image-viewer">
      {(seriesDescription || modality) && (
        <div className="coop-image-viewer-series">
          {modality && <span className="coop-pill status-요청" style={{ marginRight: 8 }}>{modality}</span>}
          {seriesDescription}
        </div>
      )}

      <div className="coop-image-viewer-frame">
        {imageUrl && <img src={imageUrl} alt={`검사 이미지 ${index + 1}/${totalCount}`} className="coop-image-viewer-img" />}
      </div>

      <div className="coop-image-viewer-controls">
        <button
          type="button"
          className="btn-coop-reset"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          ← 이전
        </button>
        <input
          type="range"
          min={0}
          max={totalCount - 1}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="coop-image-viewer-slider"
        />
        <button
          type="button"
          className="btn-coop-reset"
          onClick={() => setIndex((i) => Math.min(totalCount - 1, i + 1))}
          disabled={index === totalCount - 1}
        >
          다음 →
        </button>
        <span className="coop-image-viewer-count">
          {index + 1} / {totalCount}
        </span>
      </div>
    </div>
  );
}

export default CoopStudyImageViewer;