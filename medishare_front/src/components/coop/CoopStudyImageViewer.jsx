import { useEffect, useState } from "react";
import api from "../common/api";
import "./Coop.css";

// <img src="...">는 커스텀 인증 헤더(X-AUTH-TOKEN)를 못 실어 보내므로,
// axios로 이미지를 blob으로 받아서 브라우저 메모리 URL로 변환해 사용한다.
function CoopStudyImageViewer({ pacsStudyId }) {
  const [seriesList, setSeriesList] = useState(null); // null = 아직 확인 전
  const [seriesNo, setSeriesNo] = useState(null);
  const [seriesInfoError, setSeriesInfoError] = useState(null);

  const [totalCount, setTotalCount] = useState(null);
  const [index, setIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);

  // 1) 검사에 속한 시리즈 목록 조회 - 검사 하나에 시리즈가 여러 개일 수 있다.
  useEffect(() => {
    if (!pacsStudyId) return;
    let ignore = false;
    api
      .get(`/coop/study/${pacsStudyId}/series.do`)
      .then((res) => {
        if (ignore) return;
        const list = res.data || [];
        setSeriesList(list);
        setSeriesNo(list.length > 0 ? list[0].seriesNo : null);
      })
      .catch(() => {
        if (!ignore) {
          setSeriesList([]);
          setSeriesInfoError("시리즈 정보를 불러올 수 없습니다.");
        }
      });
    return () => {
      ignore = true;
    };
  }, [pacsStudyId]);

  // 2) 선택된 시리즈의 이미지 개수 조회 (시리즈 바뀌면 인덱스 0으로 리셋)
  useEffect(() => {
    if (!seriesNo) return;
    let ignore = false;
    api
      .get(`/coop/series/${seriesNo}/instances.do`)
      .then((res) => {
        if (ignore) return;
        setTotalCount(res.data.count || 0);
        setIndex(0);
      })
      .catch(() => {
        if (!ignore) setTotalCount(0);
      });
    return () => {
      ignore = true;
    };
  }, [seriesNo]);

  // 3) 현재 인덱스의 이미지를 blob으로 받아와서 표시.
  // 새 이미지가 도착하기 전까지는 imageUrl을 건드리지 않아 이전 이미지가 그대로 남아있는다.
  useEffect(() => {
    if (!seriesNo || !totalCount) return;
    let ignore = false;
    let objectUrl = null;

    api
      .get(`/coop/series/${seriesNo}/instance/${index}/preview.do`, { responseType: "blob" })
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
  }, [seriesNo, index, totalCount]);

  if (seriesList === null) {
    return <div className="coop-image-viewer-empty">이미지 정보 확인 중...</div>;
  }
  if (seriesList.length === 0) {
    return <div className="coop-image-viewer-empty">{seriesInfoError || "표시할 이미지가 없습니다."}</div>;
  }

  const currentSeries = seriesList.find((s) => s.seriesNo === seriesNo);

  return (
    <div className="coop-image-viewer">
      {seriesList.length > 1 && (
        <div className="coop-series-tabs">
          {seriesList.map((s, i) => (
            <button
              key={s.seriesNo}
              type="button"
              className={"coop-series-tab" + (s.seriesNo === seriesNo ? " active" : "")}
              onClick={() => setSeriesNo(s.seriesNo)}
            >
              {s.modality ? `${s.modality} · ` : ""}
              {s.seriesDescription || `시리즈 ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {currentSeries && (currentSeries.seriesDescription || currentSeries.modality) && (
        <div className="coop-image-viewer-series">
          {currentSeries.modality && (
            <span className="coop-pill status-요청" style={{ marginRight: 8 }}>{currentSeries.modality}</span>
          )}
          {currentSeries.seriesDescription}
        </div>
      )}

      {totalCount === 0 ? (
        <div className="coop-image-viewer-empty">이 시리즈에는 표시할 이미지가 없습니다.</div>
      ) : (
        <>
          <div className="coop-image-viewer-frame">
            {imageUrl && (
              <img src={imageUrl} alt={`검사 이미지 ${index + 1}/${totalCount}`} className="coop-image-viewer-img" />
            )}
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
              max={Math.max(0, totalCount - 1)}
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
        </>
      )}
    </div>
  );
}

export default CoopStudyImageViewer;