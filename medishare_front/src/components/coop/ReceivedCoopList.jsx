import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import "./coop.css";

// coop_request.status ENUM 전체 - 기본 노출 목록은 취소를 제외한다 (받은 협진함 기본 규칙)
const ALL_STATUSES = ["요청", "수락", "거절", "취소", "만료"];
const DEFAULT_STATUSES = ["요청", "수락", "거절", "만료"];

function formatDateTime(str) {
  if (!str) return "-";
  // 서버가 "yyyy-MM-dd HH:mm" 형태로 내려준다 (CoopRequestServiceImpl 참고)
  const [date, time] = str.split(" ");
  return `${date.slice(5)} ${time}`;
}

function ReceivedCoopList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page") || 1);
  const urlStatuses = searchParams.get("status");
  const urlUnreadOnly = searchParams.get("unreadOnly") === "true";
  const urlFrom = searchParams.get("from") || "";
  const urlTo = searchParams.get("to") || "";

  const [list, setList] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 필터 패널 - 기본 숨김, 버튼 클릭 시에만 펼침
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatuses, setDraftStatuses] = useState(
    urlStatuses ? urlStatuses.split(",") : DEFAULT_STATUSES
  );
  const [draftUnreadOnly, setDraftUnreadOnly] = useState(urlUnreadOnly);
  const [draftFrom, setDraftFrom] = useState(urlFrom);
  const [draftTo, setDraftTo] = useState(urlTo);

  const appliedStatuses = urlStatuses ? urlStatuses.split(",") : DEFAULT_STATUSES;
  const isFilterModified =
    appliedStatuses.length !== DEFAULT_STATUSES.length ||
    !appliedStatuses.every((s) => DEFAULT_STATUSES.includes(s)) ||
    urlUnreadOnly ||
    urlFrom ||
    urlTo;

  useEffect(() => {
    let ignore = false;

    // setLoading/setError를 effect 본문에서 곧바로(동기적으로) 호출하면
    // "Calling setState synchronously within an effect" 경고가 뜨므로
    // 마이크로태스크로 한 틱 미뤄서 호출한다. (체감 동작은 동일)
    queueMicrotask(() => {
      if (!ignore) {
        setLoading(true);
        setError(null);
      }
    });

    api
      .get("/coop/received.do", {
        params: {
          page,
          status: urlStatuses || undefined,
          unreadOnly: urlUnreadOnly || undefined,
          from: urlFrom || undefined,
          to: urlTo || undefined,
        },
      })
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
  }, [page, urlStatuses, urlUnreadOnly, urlFrom, urlTo]);

  useEffect(() => {
    api
      .get("/coop/unreadCount.do")
      .then((res) => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => {});
  }, [list]);

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
    if (draftUnreadOnly) params.unreadOnly = "true";
    if (draftFrom) params.from = draftFrom;
    if (draftTo) params.to = draftTo;
    setSearchParams(params);
    setFilterOpen(false);
  };

  const resetFilter = () => {
    setDraftStatuses(DEFAULT_STATUSES);
    setDraftUnreadOnly(false);
    setDraftFrom("");
    setDraftTo("");
    setSearchParams({ page: "1" });
    setFilterOpen(false);
  };

  const goPage = (p) => {
    const params = { page: String(p) };
    if (urlStatuses) params.status = urlStatuses;
    if (urlUnreadOnly) params.unreadOnly = "true";
    if (urlFrom) params.from = urlFrom;
    if (urlTo) params.to = urlTo;
    setSearchParams(params);
  };

  return (
    <div className="coop-page">
      <div className="coop-header">
        <h3 className="coop-title">
          받은 협진함
          {unreadCount > 0 && <span className="count-badge">{unreadCount}</span>}
        </h3>
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
            <input
              type="date"
              className="coop-filter-date"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
            />
            <span style={{ color: "var(--coop-muted)" }}>~</span>
            <input
              type="date"
              className="coop-filter-date"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
            />
            <label className="coop-filter-checkbox">
              <input
                type="checkbox"
                checked={draftUnreadOnly}
                onChange={(e) => setDraftUnreadOnly(e.target.checked)}
              />
              안읽음만 보기
            </label>
          </div>
          <div className="coop-filter-actions">
            <button type="button" className="btn-coop-reset" onClick={resetFilter}>
              초기화
            </button>
            <button type="button" className="btn-coop-apply" onClick={applyFilter}>
              적용
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">불러오는 중...</div>
      ) : error ? (
        <div className="coop-empty">{error}</div>
      ) : list.length === 0 ? (
        <div className="coop-empty">받은 협진 요청이 없습니다.</div>
      ) : (
        <div className="coop-list-card">
          {list.map((r) => (
            <div
              key={r.coopRequestId}
              className="coop-row"
              onClick={() => navigate(`/coop/view?no=${r.coopRequestId}`)}
            >
              <span className={"coop-row-unread-dot" + (r.isRead ? " hidden" : "")} />
              <div className="coop-row-main">
                <div className="coop-row-top">
                  <span className={"coop-row-patient" + (r.isRead ? "" : " unread")}>
                    {r.patientName || `환자 #${r.patientId}`}
                  </span>
                  <span className="coop-row-counterpart">
                    {r.reqDoctorName || `요청의사 #${r.reqDoctorId}`} → 나
                  </span>
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
          ))}
        </div>
      )}

      {pageObject && pageObject.totalPage > 1 && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={"page-item" + (page === 1 ? " disabled" : "")}>
              <button className="page-link" disabled={page === 1} onClick={() => goPage(1)}>
                &laquo;
              </button>
            </li>
            <li className={"page-item" + (pageObject.startPage === 1 ? " disabled" : "")}>
              <button
                className="page-link"
                disabled={pageObject.startPage === 1}
                onClick={() => goPage(pageObject.startPage - 1)}
              >
                &lt;
              </button>
            </li>
            {Array.from(
              { length: pageObject.endPage - pageObject.startPage + 1 },
              (_, i) => pageObject.startPage + i
            ).map((p) => (
              <li key={p} className={"page-item " + (p === page ? "active" : "")}>
                <button className="page-link" onClick={() => goPage(p)}>
                  {p}
                </button>
              </li>
            ))}
            <li className={"page-item" + (pageObject.endPage === pageObject.totalPage ? " disabled" : "")}>
              <button
                className="page-link"
                disabled={pageObject.endPage === pageObject.totalPage}
                onClick={() => goPage(pageObject.endPage + 1)}
              >
                &gt;
              </button>
            </li>
            <li className={"page-item" + (page === pageObject.totalPage ? " disabled" : "")}>
              <button
                className="page-link"
                disabled={page === pageObject.totalPage}
                onClick={() => goPage(pageObject.totalPage)}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default ReceivedCoopList;