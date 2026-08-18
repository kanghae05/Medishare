import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";
import DoctorAutocomplete from "./DoctorAutocomplete";
import "./Coop.css";

const ALL_STATUSES = ["요청", "수락", "거절", "취소", "만료"];

function formatDateTime(str) {
  if (!str) return "-";
  const [date, time] = str.split(" ");
  return `${date} ${time.slice(0, 5)}`;
}

// 관리자 전용 - 시스템 전체 협진요청 조회. 자기 관련건만 보는 일반 "전체 협진 내역"과 달리
// 요청자/수신자/진료과까지 자유롭게 필터링해서 아무 요청이나 다 볼 수 있다 (읽기 전용).
function CoopAdminList() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [pageObject, setPageObject] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reqDoctor, setReqDoctor] = useState(null);
  const [recvDoctor, setRecvDoctor] = useState(null);
  const [deptId, setDeptId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [statuses, setStatuses] = useState(ALL_STATUSES);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    let ignore = false;
    api
      .get("/coop/lookup/departments.do")
      .then((res) => {
        if (!ignore) setDepartments(res.data || []);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const load = (targetPage, overrides = {}) => {
    let ignore = false;
    const p = targetPage ?? page;
    const f = {
      reqDoctor,
      recvDoctor,
      deptId,
      statuses,
      from,
      to,
      ...overrides,
    };
    setLoading(true);
    setError(null);

    const params = { page: p };
    if (f.reqDoctor) params.reqDoctorId = f.reqDoctor.no;
    if (f.recvDoctor) params.recvDoctorId = f.recvDoctor.no;
    if (f.deptId) params.deptId = f.deptId;
    if (f.statuses.length && f.statuses.length !== ALL_STATUSES.length) params.status = f.statuses.join(",");
    if (f.from) params.from = f.from;
    if (f.to) params.to = f.to;

    api
      .get("/coop/admin/all.do", { params })
      .then((res) => {
        if (!ignore) {
          setList(res.data.list || []);
          setPageObject(res.data.pageObject || null);
        }
      })
      .catch(() => {
        if (!ignore) setError("목록을 불러오지 못했습니다. (관리자 권한이 필요합니다)");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  };

  // 최초 마운트 시 한 번 조회 - load() 자체는 버튼 클릭(이벤트 핸들러)에서도 재사용하므로
  // 그쪽은 동기 setState라도 문제없지만, 여기 effect에서 직접 부르면 effect 본문에서
  // 곧바로 setState가 일어나는 셈이라 별도로 마이크로태스크로 미룬다.
  // load()가 자체적으로 반환하는 취소 함수도 그대로 이어받아서, 언마운트 시 진행 중이던
  // 요청의 setState까지 확실히 막는다.
  useEffect(() => {
    let cancelled = false;
    let cancelLoad = null;
    queueMicrotask(() => {
      if (!cancelled) {
        cancelLoad = load(1);
      }
    });
    return () => {
      cancelled = true;
      if (cancelLoad) cancelLoad();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStatus = (s) => {
    setStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const applyFilters = () => {
    setPage(1);
    load(1);
  };

  const resetFilters = () => {
    setReqDoctor(null);
    setRecvDoctor(null);
    setDeptId("");
    setStatuses(ALL_STATUSES);
    setFrom("");
    setTo("");
    setPage(1);
    // state는 다음 렌더에야 반영되니, 리셋된 값을 곧바로 쓰려면 override로 직접 넘긴다
    // (queueMicrotask로 미뤄도 클로저가 예전 state를 그대로 참조해서 소용없다).
    load(1, { reqDoctor: null, recvDoctor: null, deptId: "", statuses: ALL_STATUSES, from: "", to: "" });
  };

  const goPage = (p) => {
    setPage(p);
    load(p);
  };

  return (
    <div className="mb-5">
      <div className="coop-module-header">
        <span className="coop-module-eyebrow">MEDISHARE · CONSULTATION · ADMIN</span>
        <h2 className="coop-page-title">협진 전체 조회 (관리자)</h2>
      </div>

      <div className="coop-page" style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div className="coop-filter-panel">
          <div className="coop-filter-row">
            <span className="coop-filter-label">요청자</span>
            <DoctorAutocomplete value={reqDoctor} onSelect={setReqDoctor} placeholder="이름으로 검색" />
          </div>
          <div className="coop-filter-row">
            <span className="coop-filter-label">수신자</span>
            <DoctorAutocomplete value={recvDoctor} onSelect={setRecvDoctor} placeholder="이름으로 검색" />
          </div>
          <div className="coop-filter-row">
            <span className="coop-filter-label">진료과</span>
            <select className="coop-form-input" style={{ width: 200 }} value={deptId} onChange={(e) => setDeptId(e.target.value)}>
              <option value="">전체</option>
              {departments.map((d) => (
                <option key={d.no} value={d.no}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>
          <div className="coop-filter-row">
            <span className="coop-filter-label">상태</span>
            <div className="coop-chip-group">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={"coop-chip" + (statuses.includes(s) ? " active" : "")}
                  onClick={() => toggleStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="coop-filter-row">
            <span className="coop-filter-label">기간</span>
            <input type="date" className="coop-filter-date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span style={{ color: "var(--coop-muted)" }}>~</span>
            <input type="date" className="coop-filter-date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="coop-filter-actions">
            <button type="button" className="btn-coop-reset" onClick={resetFilters}>초기화</button>
            <button type="button" className="btn-coop-apply" onClick={applyFilters}>조회</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">불러오는 중...</div>
        ) : error ? (
          <div className="coop-empty">{error}</div>
        ) : list.length === 0 ? (
          <div className="coop-empty">조건에 맞는 협진 요청이 없습니다.</div>
        ) : (
          <div className="coop-ledger">
            <div className="coop-ledger-row coop-ledger-head" style={{ gridTemplateColumns: "26px 1fr 92px 130px" }}>
              <span className="coop-ledger-no">NO</span>
              <span>협진 내역</span>
              <span className="coop-ledger-col-status">상태</span>
              <span className="coop-ledger-col-time">시각</span>
            </div>
            {list.map((r, idx) => {
              const counterpart =
                r.recvType === "지정의사"
                  ? r.recvDoctorName || `의사 #${r.recvDoctorId}`
                  : r.acceptDoctorId
                  ? `${r.recvDeptName || "진료과"} (${r.acceptDoctorName})`
                  : r.recvDeptName || "진료과"; // 수락 전이면 부서명만 - 미수락 여부는 옆 상태 배지로 이미 보임
              return (
                <div
                  key={r.coopRequestId}
                  className="coop-ledger-row"
                  style={{ gridTemplateColumns: "26px 1fr 92px 130px" }}
                  onClick={() => navigate(`/coop/view?no=${r.coopRequestId}`)}
                >
                  <span className="coop-ledger-no">
                    {String((page - 1) * (pageObject?.perPageNum || 10) + idx + 1).padStart(2, "0")}
                  </span>
                  <div className="coop-ledger-main">
                    <div className="coop-row-top">
                      <span className="coop-row-counterpart-primary">
                        {r.reqDoctorName} → {counterpart}
                      </span>
                    </div>
                    <div className="coop-row-content">{r.reqContent}</div>
                  </div>
                  <span className="coop-ledger-col-status">
                    <span className={"coop-pill status-" + r.status}>{r.status}</span>
                  </span>
                  <span className="coop-ledger-col-time coop-row-time">{formatDateTime(r.reqTime)}</span>
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
    </div>
  );
}

export default CoopAdminList;