import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../components/common/api";
import AdminPagination from "../../components/common/AdminPagination";
import "./AdminAudit.css";

const initialFilters = {
  memberKeyword: "",
  patientId: "",
  studyKeyword: "",
  departmentNo: "",
  dataType: "",
  actionType: "",
  startDate: "",
  endDate: "",
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString("ko-KR") : "-");

export default function ChangeHistoryManagement({ isAdmin }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [departments, setDepartments] = useState([]);
  const [historyPage, setHistoryPage] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
  const [message, setMessage] = useState("");

  const loadHistories = async (page = 0) => {
    const params = { page, size: 20 };
    Object.entries(filters).forEach(([key, value]) => {
      if (String(value).trim()) params[key] = String(value).trim();
    });
    const response = await api.get("/api/admin/change-logs", { params });
    setHistoryPage(response.data);
  };

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/member/departments.do")
      .then((response) => setDepartments(response.data))
      .catch(() => setDepartments([]));
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadHistories().catch((error) => setMessage(error.response?.data?.message || "변경 이력 목록을 불러오지 못했습니다."));
    }
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const search = (event) => {
    event.preventDefault();
    setMessage("");
    loadHistories().catch((error) => setMessage(error.response?.data?.message || "변경 이력을 검색하지 못했습니다."));
  };

  const reset = () => {
    setFilters(initialFilters);
    setMessage("");
    api.get("/api/admin/change-logs", { params: { page: 0, size: 20 } })
      .then((response) => setHistoryPage(response.data))
      .catch((error) => setMessage(error.response?.data?.message || "변경 이력 목록을 불러오지 못했습니다."));
  };

  const createCount = historyPage.content.filter((history) => history.actionType === "CREATE").length;
  const updateCount = historyPage.content.filter((history) => history.actionType === "UPDATE").length;
  const deleteCount = historyPage.content.filter((history) => history.actionType === "DELETE").length;

  return (
    <section className="admin-audit-page">
      <div className="admin-audit-hero">
        <div>
          <span className="admin-audit-eyebrow">MEDISHARE ADMIN</span>
          <h1>의료 데이터 변경 이력</h1>
          <p>판독소견 생성, 수정, 삭제 이력을 추적해 의료 데이터 변경 흐름을 관리합니다.</p>
        </div>
        <div className="admin-audit-hero-card" aria-label="변경 이력 요약">
          <span>Change Monitor</span>
          <strong>{Number(historyPage.totalElements || 0).toLocaleString()}</strong>
          <small>전체 변경 이력</small>
        </div>
      </div>

      <div className="admin-audit-summary">
        <div><span>현재 페이지</span><strong>{historyPage.content.length}</strong></div>
        <div><span>생성</span><strong>{createCount}</strong></div>
        <div><span>수정</span><strong>{updateCount}</strong></div>
        <div><span>삭제</span><strong>{deleteCount}</strong></div>
      </div>

      <form className="admin-audit-filter" onSubmit={search}>
        <input placeholder="의료진 이름 또는 로그인 ID" value={filters.memberKeyword} onChange={(event) => updateFilter("memberKeyword", event.target.value)} />
        <input placeholder="환자 ID" value={filters.patientId} onChange={(event) => updateFilter("patientId", event.target.value)} />
        <input placeholder="Study 번호 또는 UID" value={filters.studyKeyword} onChange={(event) => updateFilter("studyKeyword", event.target.value)} />
        <select value={filters.departmentNo} onChange={(event) => updateFilter("departmentNo", event.target.value)}>
          <option value="">전체 진료과</option>
          {departments.map((department) => <option key={department.no} value={department.no}>{department.departmentName}</option>)}
        </select>
        <select value={filters.dataType} onChange={(event) => updateFilter("dataType", event.target.value)}>
          <option value="">전체 데이터 유형</option>
          <option value="REPORT">REPORT</option>
        </select>
        <select value={filters.actionType} onChange={(event) => updateFilter("actionType", event.target.value)}>
          <option value="">전체 변경</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input type="date" value={filters.startDate} onChange={(event) => updateFilter("startDate", event.target.value)} />
        <input type="date" value={filters.endDate} onChange={(event) => updateFilter("endDate", event.target.value)} />
        <div className="admin-audit-actions">
          <button type="submit">검색</button>
          <button type="button" onClick={reset}>초기화</button>
        </div>
      </form>

      {message && <div className="admin-audit-alert">{message}</div>}

      <div className="admin-audit-table-card">
        <div className="admin-audit-table-head">
          <div>
            <span>CHANGE LOG</span>
            <h2>변경 기록</h2>
          </div>
        </div>
        <div className="admin-audit-table-wrap">
          <table className="admin-audit-table">
            <thead>
              <tr>
                <th>변경 시간</th>
                <th>변경자</th>
                <th>진료과</th>
                <th>환자 ID</th>
                <th>Study</th>
                <th>유형</th>
                <th>변경</th>
                <th>사유</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {historyPage.content.length ? historyPage.content.map((history) => (
                <tr key={history.historyNo}>
                  <td>{formatDateTime(history.changedAt)}</td>
                  <td><strong>{history.memberName}</strong><span>{history.loginId}</span></td>
                  <td>{history.departmentName || "-"}</td>
                  <td>{history.patientId || (history.patientNo ? `#${history.patientNo}` : "-")}</td>
                  <td>{history.studyNo ? `#${history.studyNo}` : "-"}</td>
                  <td>{history.dataType}</td>
                  <td><span className={`admin-audit-badge ${String(history.actionType).toLowerCase()}`}>{history.actionType}</span></td>
                  <td>{history.changeReason || "-"}</td>
                  <td><button type="button" className="admin-audit-link" onClick={() => navigate(`/admin/change-logs/${history.historyNo}`)}>상세</button></td>
                </tr>
              )) : (
                <tr><td colSpan="9" className="admin-audit-empty">조회된 변경 이력이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        page={historyPage.number || 0}
        totalPages={historyPage.totalPages || 0}
        totalElements={historyPage.totalElements || 0}
        onPageChange={(page) => loadHistories(page).catch((error) => setMessage(error.response?.data?.message || "페이지를 불러오지 못했습니다."))}
      />
    </section>
  );
}
