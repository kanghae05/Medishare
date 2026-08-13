import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import "./Coop.css";

// 의사명 + 메타(진료과·세부전공·직급)를 같이 표시. 이름이 없으면 번호로 폴백.
function renderDoctor(name, meta, id, fallbackLabel = "의사") {
  if (!name) return `${fallbackLabel} #${id}`;
  return (
    <>
      {name}
      {meta && <span className="coop-doctor-meta"> ({meta})</span>}
    </>
  );
}

// 목록에서는 공간이 좁으니 메타 전체 대신 진료과만 짧게 보여준다.
function renderDoctorShort(name, meta, id, fallbackLabel = "의사") {
  if (!name) return `${fallbackLabel} #${id}`;
  const dept = meta ? meta.split(" · ")[0] : null;
  return (
    <>
      {name}
      {dept && <span className="coop-doctor-meta"> ({dept})</span>}
    </>
  );
}

const ALL_STATUSES = ["요청", "수락", "거절", "취소", "만료"];
const DEFAULT_RECEIVED_STATUSES = ["요청", "수락", "거절", "만료"]; // 받은 협진함만 취소 기본 제외

const MODE_CONFIG = {
  received: { title: "받은 협진함", endpoint: "/coop/received.do", defaultStatuses: DEFAULT_RECEIVED_STATUSES, hasUnreadFilter: true },
  sent:     { title: "보낸 협진함", endpoint: "/coop/sent.do",     defaultStatuses: ALL_STATUSES,          hasUnreadFilter: false },
  all:      { title: "전체 협진 내역", endpoint: "/coop/all.do",   defaultStatuses: ALL_STATUSES,          hasUnreadFilter: false },
};

function formatDateTime(str) {
  if (!str) return "-";
  const [date, time] = str.split(" ");
  return `${date.slice(5)} ${time}`;
}

// mode: "received" | "sent" | "all"
function CoopRequestList({ mode }) {
  const config = MODE_CONFIG[mode];
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page") || 1);
  const urlStatuses = searchParams.get("status");
  const urlUnreadOnly = searchParams.get("unreadOnly") === "true";
  const urlFrom = searchParams.get("from") || "";
  const urlTo = searchParams.get("to") || "";

  const [list, setList] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatuses, setDraftStatuses] = useState(
    urlStatuses ? urlStatuses.split(",") : config.defaultStatuses
  );
  const [draftUnreadOnly, setDraftUnreadOnly] = useState(urlUnreadOnly);
  const [draftFrom, setDraftFrom] = useState(urlFrom);
  const [draftTo, setDraftTo] = useState(urlTo);

  // mode가 바뀌면(같은 컴포넌트를 다른 라우트에서 재사용) 필터 초안도 그 모드 기본값으로 리셋
  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (ignore) return;
      setDraftStatuses(urlStatuses ? urlStatuses.split(",") : config.defaultStatuses);
      setDraftUnreadOnly(urlUnreadOnly);
      setDraftFrom(urlFrom);
      setDraftTo(urlTo);
    });
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const appliedStatuses = urlStatuses ? urlStatuses.split(",") : config.defaultStatuses;
  const isFilterModified =
    appliedStatuses.length !== config.defaultStatuses.length ||
    !appliedStatuses.every((s) => config.defaultStatuses.includes(s)) ||
    urlUnreadOnly ||
    urlFrom ||
    urlTo;

  useEffect(() => {
    let ignore = false;

    queueMicrotask(() => {
      if (!ignore) {
        setLoading(true);
        setError(null);
      }
    });

    const params = {
      page,
      status: urlStatuses || undefined,
      from: urlFrom || undefined,
      to: urlTo || undefined,
    };
    if (config.hasUnreadFilter) params.unreadOnly = urlUnreadOnly || undefined;

    api
      .get(config.endpoint, { params })
      .then((res) => {
        if (ignore) return;
        setList(res.data.list || []);
        setPageObject(res.data.pageObject || null);
      })
      .catch(() => {
        if (!ignore) setError("협진 요청 목록을 불러오는 데 실패했습니다.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, page, urlStatuses, urlUnreadOnly, urlFrom, urlTo]);

  const toggleDraftStatus = (status) => {
    setDraftStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const applyFilter = () => {
    const params = { page: "1" };
    if (draftStatuses.length && draftStatuses.length !== ALL_STATUSES.length) {
      params.status = draftStatuses.join(",");
    }
    if (config.hasUnreadFilter && draftUnreadOnly) params.unreadOnly = "true";
    if (draftFrom) params.from = draftFrom;
    if (draftTo) params.to = draftTo;
    setSearchParams(params);
    setFilterOpen(false);
  };

  const resetFilter = () => {
    setDraftStatuses(config.defaultStatuses);
    setDraftUnreadOnly(false);
    setDraftFrom("");
    setDraftTo("");
    setSearchParams({ page: "1" });
    setFilterOpen(false);
  };

  const goPage = (p) => {
    const params = { page: String(p) };
    if (urlStatuses) params.status = urlStatuses;
    if (config.hasUnreadFilter && urlUnreadOnly) params.unreadOnly = "true";
    if (urlFrom) params.from = urlFrom;
    if (urlTo) params.to = urlTo;
    setSearchParams(params);
  };

  return (
    <div className="coop-page">
      <div className="coop-header">
        <h3 className="coop-title">{config.title}</h3>
        <button type="button" className="btn-coop-filter" onClick={() => setFilterOpen((v) => !v)}>
          {isFilterModified && <span className="dot" />}
          필터 {filterOpen ? "▲" : "▼"}
        </button>
      </div>

      {filterOpen && (
        <div className="coop-filter-panel">
          <div className="coop-filter-row">
            <span className="coop-filter-label">상태</span>
            <div className="coop-chip-group">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={"coop-chip" + (draftStatuses.includes(s) ? " active" : "")}
                  onClick={() => toggleDraftStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="coop-filter-row">
            <span className="coop-filter-label">기간</span>
            <input type="date" className="coop-filter-date" value={draftFrom} onChange={(e) => setDraftFrom(e.target.value)} />
            <span style={{ color: "var(--coop-muted)" }}>~</span>
            <input type="date" className="coop-filter-date" value={draftTo} onChange={(e) => setDraftTo(e.target.value)} />
            {config.hasUnreadFilter && (
              <label className="coop-filter-checkbox">
                <input type="checkbox" checked={draftUnreadOnly} onChange={(e) => setDraftUnreadOnly(e.target.checked)} />
                안읽음만 보기
              </label>
            )}
          </div>
          <div className="coop-filter-actions">
            <button type="button" className="btn-coop-reset" onClick={resetFilter}>초기화</button>
            <button type="button" className="btn-coop-apply" onClick={applyFilter}>적용</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">불러오는 중...</div>
      ) : error ? (
        <div className="coop-empty">{error}</div>
      ) : list.length === 0 ? (
        <div className="coop-empty">
          {mode === "received" ? "받은" : mode === "sent" ? "보낸" : ""} 협진 요청이 없습니다.
        </div>
      ) : (
        <div className="coop-list-card">
          {list.map((r) => {
            const isIncoming = mode === "all" ? r.direction === "received" : mode === "received";

            let counterpartDisplay;
            if (isIncoming) {
              counterpartDisplay = renderDoctorShort(r.reqDoctorName, r.reqDoctorMeta, r.reqDoctorId, "요청의사");
            } else if (r.acceptDoctorId) {
              // 진료과 요청이든 지정의사 요청이든, 이미 수락한 의사가 있으면 그 사람이 상대방
              counterpartDisplay = renderDoctorShort(r.acceptDoctorName, r.acceptDoctorMeta, r.acceptDoctorId, "의사");
            } else if (r.recvType === "지정의사") {
              counterpartDisplay = renderDoctorShort(r.recvDoctorName, r.recvDoctorMeta, r.recvDoctorId, "의사");
            } else {
              // 진료과 요청 + 아직 수락 전 = 진짜로 "누가 받을지 미정"인 상태
              counterpartDisplay = (r.recvDeptName || `진료과 #${r.recvDeptId}`) + " (미정)";
            }

            return (
              <div key={r.coopRequestId} className="coop-row" onClick={() => navigate(`/coop/view?no=${r.coopRequestId}`)}>
                <span className={"coop-row-unread-dot" + (!isIncoming || r.isRead ? " hidden" : "")} />
                <div className="coop-row-main">
                  <div className="coop-row-top">
                    <span className={"coop-row-counterpart-primary" + (isIncoming && !r.isRead ? " unread" : "")}>
                      {counterpartDisplay}
                    </span>
                    {mode === "all" && (
                      <span className={"coop-direction-badge" + (isIncoming ? " in" : " out")}>
                        {isIncoming ? "받음" : "보냄"}
                      </span>
                    )}
                  </div>
                  <div className="coop-row-sub">
                    <span className="coop-row-patient-label">환자</span>
                    <span className="coop-row-patient">{r.patientName || `환자 #${r.patientId}`}</span>
                  </div>
                  <div className="coop-row-content">{r.reqContent}</div>
                </div>
                <div className="coop-row-side">
                  <span className={"coop-pill status-" + (r.displayStatus || r.status)}>
                    {r.displayStatus || r.status}
                  </span>
                  <span className="coop-row-time">{formatDateTime(r.reqTime)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pageObject && pageObject.totalPage > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={"page-item" + (page === 1 ? " disabled" : "")}>
              <button className="page-link" disabled={page === 1} onClick={() => goPage(1)}>&laquo;</button>
            </li>
            <li className={"page-item" + (pageObject.startPage === 1 ? " disabled" : "")}>
              <button className="page-link" disabled={pageObject.startPage === 1} onClick={() => goPage(pageObject.startPage - 1)}>&lt;</button>
            </li>
            {Array.from({ length: pageObject.endPage - pageObject.startPage + 1 }, (_, i) => pageObject.startPage + i).map((p) => (
              <li key={p} className={"page-item " + (p === page ? "active" : "")}>
                <button className="page-link" onClick={() => goPage(p)}>{p}</button>
              </li>
            ))}
            <li className={"page-item" + (pageObject.endPage === pageObject.totalPage ? " disabled" : "")}>
              <button className="page-link" disabled={pageObject.endPage === pageObject.totalPage} onClick={() => goPage(pageObject.endPage + 1)}>&gt;</button>
            </li>
            <li className={"page-item" + (page === pageObject.totalPage ? " disabled" : "")}>
              <button className="page-link" disabled={page === pageObject.totalPage} onClick={() => goPage(pageObject.totalPage)}>&raquo;</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default CoopRequestList;