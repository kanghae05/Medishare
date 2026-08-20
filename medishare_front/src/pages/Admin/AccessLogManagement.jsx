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
  accessResult: "",
  startDate: "",
  endDate: "",
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString("ko-KR") : "-");

export default function AccessLogManagement({ isAdmin }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [departments, setDepartments] = useState([]);
  const [logPage, setLogPage] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
  const [message, setMessage] = useState("");

  const loadLogs = async (page = 0) => {
    const params = { page, size: 20 };
    Object.entries(filters).forEach(([key, value]) => {
      if (String(value).trim()) params[key] = String(value).trim();
    });
    const response = await api.get("/api/admin/access-logs", { params });
    setLogPage(response.data);
  };

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/member/departments.do")
      .then((response) => setDepartments(response.data))
      .catch(() => setDepartments([]));
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadLogs().catch((error) => setMessage(error.response?.data?.message || "접근 이력 목록을 불러오지 못했습니다."));
    }
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const search = (event) => {
    event.preventDefault();
    setMessage("");
    loadLogs().catch((error) => setMessage(error.response?.data?.message || "접근 이력을 검색하지 못했습니다."));
  };

  const reset = () => {
    setFilters(initialFilters);
    setMessage("");
    api.get("/api/admin/access-logs", { params: { page: 0, size: 20 } })
      .then((response) => setLogPage(response.data))
      .catch((error) => setMessage(error.response?.data?.message || "접근 이력 목록을 불러오지 못했습니다."));
  };

  const successCount = logPage.content.filter((log) => log.accessResult === "SUCCESS").length;
  const deniedCount = logPage.content.filter((log) => log.accessResult === "DENIED").length;

  return (
    <section className="admin-audit-page">
      <div className="admin-audit-hero">
        <div>
          <span className="admin-audit-eyebrow">MEDISHARE ADMIN</span>
          <h1>의료 데이터 접근 이력</h1>
          <p>PACS Study와 의료 영상 조회 기록을 의료진, 환자, 기간 조건으로 추적합니다.</p>
        </div>
        <div className="admin-audit-hero-card" aria-label="접근 이력 요약">
          <span>Access Monitor</span>
          <strong>{Number(logPage.totalElements || 0).toLocaleString()}</strong>
          <small>전체 접근 이력</small>
        </div>
      </div>

      <div className="admin-audit-summary">
        <div><span>현재 페이지</span><strong>{logPage.content.length}</strong></div>
        <div><span>성공</span><strong>{successCount}</strong></div>
        <div><span>거부</span><strong>{deniedCount}</strong></div>
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
          <option value="STUDY">STUDY</option>
          <option value="IMAGE">IMAGE</option>
        </select>
        <select value={filters.actionType} onChange={(event) => updateFilter("actionType", event.target.value)}>
          <option value="">전체 행동</option>
          <option value="VIEW">VIEW</option>
        </select>
        <select value={filters.accessResult} onChange={(event) => updateFilter("accessResult", event.target.value)}>
          <option value="">전체 결과</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="DENIED">DENIED</option>
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
            <span>ACCESS LOG</span>
            <h2>조회 기록</h2>
          </div>
        </div>
        <div className="admin-audit-table-wrap">
          <table className="admin-audit-table">
            <thead>
              <tr>
                <th>접근 시간</th>
                <th>의료진</th>
                <th>진료과</th>
                <th>환자 ID</th>
                <th>Study</th>
                <th>유형</th>
                <th>행동</th>
                <th>결과</th>
                <th>IP</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {logPage.content.length ? logPage.content.map((log) => (
                <tr key={log.logNo}>
                  <td>{formatDateTime(log.accessedAt)}</td>
                  <td><strong>{log.memberName}</strong><span>{log.loginId}</span></td>
                  <td>{log.departmentName || "-"}</td>
                  <td>{log.patientId || (log.patientNo ? `#${log.patientNo}` : "-")}</td>
                  <td>{log.studyNo ? `#${log.studyNo}` : "-"}</td>
                  <td>{log.dataType}</td>
                  <td>{log.actionType}</td>
                  <td><span className={`admin-audit-badge ${log.accessResult === "SUCCESS" ? "success" : "danger"}`}>{log.accessResult}</span></td>
                  <td>{log.ipAddress || "-"}</td>
                  <td><button type="button" className="admin-audit-link" onClick={() => navigate(`/admin/access-logs/${log.logNo}`)}>상세</button></td>
                </tr>
              )) : (
                <tr><td colSpan="10" className="admin-audit-empty">조회된 접근 이력이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        page={logPage.number || 0}
        totalPages={logPage.totalPages || 0}
        totalElements={logPage.totalElements || 0}
        onPageChange={(page) => loadLogs(page).catch((error) => setMessage(error.response?.data?.message || "페이지를 불러오지 못했습니다."))}
      />
    </section>
  );
}
