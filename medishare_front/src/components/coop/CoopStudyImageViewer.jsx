import { useEffect, useRef, useState } from "react";
import api from "../common/api";
import CoopImageAnnotator from "./CoopImageAnnotator";
import "./Coop.css";

// <img src="...">는 커스텀 인증 헤더(X-AUTH-TOKEN)를 못 실어 보내므로,
// axios로 이미지를 blob으로 받아서 브라우저 메모리 URL로 변환해 사용한다.
// coopRequestId가 주어지면(=채팅이 가능한 화면이면) "그리기" 버튼을 같이 보여준다.
// onImageSent: 그림 전송 성공 시 호출 - 채팅창에서 인라인으로 띄웠을 때 자동으로 접는 용도.
//
// 슬라이더를 영상처럼 매끄럽게 넘기기 위해, 시리즈를 고르는 순간 전체 프레임을
// 백그라운드에서 동시에 여러 장씩 미리 받아둔다. 이미 받은 프레임은 네트워크 요청
// 없이 즉시 표시되고, 아직 안 받은 프레임으로 점프하면 그것부터 우선 받아온다.
const PRELOAD_CONCURRENCY = 6;

function CoopStudyImageViewer({ pacsStudyId, coopRequestId, onImageSent }) {
  const [annotating, setAnnotating] = useState(false);
  const [seriesList, setSeriesList] = useState(null); // null = 아직 확인 전
  const [seriesNo, setSeriesNo] = useState(null);
  const [seriesInfoError, setSeriesInfoError] = useState(null);

  const [totalCount, setTotalCount] = useState(null);
  const [index, setIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [loadedCount, setLoadedCount] = useState(0);

  const framesRef = useRef([]); // 인덱스별 object URL. 아직 안 받아온 자리는 null.
  const frameRef = useRef(null); // 이미지 프레임 DOM - 네이티브 휠 이벤트를 non-passive로 직접 붙이기 위함
  const indexRef = useRef(0); // 이펙트 콜백 안에서 "지금 보고 있는 인덱스"를 최신값으로 참조하기 위함

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

  // 3) 시리즈+개수가 확정되면, 전체 프레임을 백그라운드에서 동시 6장씩 미리 받기 시작한다.
  // 다 받아두면 그 뒤로는 슬라이더를 아무리 빨리 움직여도 네트워크 지연 없이 바로바로 바뀐다.
  useEffect(() => {
    if (!seriesNo || !totalCount) return;
    let cancelled = false;

    framesRef.current = new Array(totalCount).fill(null);
    queueMicrotask(() => {
      if (!cancelled) {
        setLoadedCount(0);
        setImageUrl(null);
      }
    });

    let nextToFetch = 0;
    let inFlight = 0;
    let loaded = 0;

    const fetchOne = (i) => {
      inFlight++;
      api
        .get(`/coop/series/${seriesNo}/instance/${i}/preview.do`, { responseType: "blob" })
        .then((res) => {
          if (cancelled) return;
          const url = URL.createObjectURL(res.data);
          if (!framesRef.current[i]) {
            framesRef.current[i] = url;
            loaded++;
            setLoadedCount(loaded);
          } else {
            URL.revokeObjectURL(url); // 우선요청이랑 겹쳐서 이미 있으면 방금 받은 건 버림
          }
          if (indexRef.current === i) {
            setImageUrl(framesRef.current[i]);
          }
        })
        .catch(() => {})
        .finally(() => {
          inFlight--;
          if (!cancelled) pump();
        });
    };

    const pump = () => {
      while (!cancelled && inFlight < PRELOAD_CONCURRENCY && nextToFetch < totalCount) {
        fetchOne(nextToFetch);
        nextToFetch++;
      }
    };
    pump();

    return () => {
      cancelled = true;
      framesRef.current.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [seriesNo, totalCount]);

  // 4) 보고 있는 인덱스가 바뀌면: 이미 받아둔 프레임이면 즉시 표시.
  // 아직 안 받아둔 프레임으로 점프한 거면, 백그라운드 순서를 기다리지 않고 그것부터 바로 요청한다.
  useEffect(() => {
    indexRef.current = index;
    if (!seriesNo) return;

    let ignore = false;
    const cached = framesRef.current[index];
    if (cached) {
      queueMicrotask(() => {
        if (!ignore) setImageUrl(cached);
      });
      return () => {
        ignore = true;
      };
    }

    queueMicrotask(() => {
      if (!ignore) setImageUrl(null);
    });
    api
      .get(`/coop/series/${seriesNo}/instance/${index}/preview.do`, { responseType: "blob" })
      .then((res) => {
        if (ignore || indexRef.current !== index) return;
        const url = URL.createObjectURL(res.data);
        if (!framesRef.current[index]) {
          framesRef.current[index] = url;
          setLoadedCount((c) => c + 1);
        }
        setImageUrl(framesRef.current[index]);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [index, seriesNo]);

  // 이미지 위에서 휠 굴릴 때 페이지 자체가 스크롤되지 않게 막아야 하는데,
  // React의 onWheel prop은 기본적으로 passive 리스너라 그 안에서 preventDefault()를 불러도 씹힌다
  // (React 17부터 성능 때문에 이렇게 바뀜). 그래서 네이티브 이벤트를 { passive: false }로 직접 붙인다.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !totalCount) return;
    const handleWheel = (e) => {
      e.preventDefault();
      setIndex((i) => {
        const next = i + (e.deltaY > 0 ? 1 : -1);
        return Math.min(totalCount - 1, Math.max(0, next));
      });
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [totalCount]);

  if (seriesList === null) {
    return <div className="coop-image-viewer-empty">이미지 정보 확인 중...</div>;
  }
  if (seriesList.length === 0) {
    return <div className="coop-image-viewer-empty">{seriesInfoError || "표시할 이미지가 없습니다."}</div>;
  }

  const currentSeries = seriesList.find((s) => s.seriesNo === seriesNo);
  const stillLoading = totalCount > 0 && loadedCount < totalCount;

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
          {stillLoading && (
            <span className="coop-image-viewer-preload">
              불러오는 중 {loadedCount}/{totalCount}장
            </span>
          )}
        </div>
      )}

      {totalCount === 0 ? (
        <div className="coop-image-viewer-empty">이 시리즈에는 표시할 이미지가 없습니다.</div>
      ) : (
        <>
          <div
            className="coop-image-viewer-frame"
            ref={frameRef}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(totalCount - 1, i + 1));
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(0, i - 1));
              }
            }}
          >
            {imageUrl && (
              <img src={imageUrl} alt={`검사 이미지 ${index + 1}/${totalCount}`} className="coop-image-viewer-img" />
            )}
          </div>
          <div className="coop-image-viewer-hint">마우스 휠 또는 방향키로 한 장씩 넘길 수 있어요</div>

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
            {coopRequestId && imageUrl && (
              <button type="button" className="btn-coop-apply" onClick={() => setAnnotating(true)}>
                그리기
              </button>
            )}
          </div>
        </>
      )}

      {annotating && (
        <CoopImageAnnotator
          coopRequestId={coopRequestId}
          imageUrl={imageUrl}
          onClose={() => setAnnotating(false)}
          onSent={onImageSent}
        />
      )}
    </div>
  );
}

export default CoopStudyImageViewer;