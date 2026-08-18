import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../components/common/api";
import AdminPagination from "../../components/common/AdminPagination";

const initialFilters = {
  memberKeyword: "", patientId: "", studyKeyword: "", departmentNo: "",
  dataType: "", actionType: "", accessResult: "", startDate: "", endDate: "",
};

const formatDateTime = (value) => value ? new Date(value).toLocaleString("ko-KR") : "-";

export default function AccessLogManagement({ isAdmin }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [departments, setDepartments] = useState([]);
  const [logPage, setLogPage] = useState({ content: [], totalPages: 0, number: 0 });
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
    api.get("/member/departments.do").then((response) => setDepartments(response.data)).catch(() => setDepartments([]));
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) loadLogs().catch((error) => setMessage(error.response?.data?.message || "접근 이력 목록을 불러오지 못했습니다."));
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

  return <div>
    <h2 className="mb-3">의료 데이터 접근 이력</h2>
    <form className="card card-body mb-3" onSubmit={search}>
      <div className="row g-2">
        <div className="col-md-4"><input className="form-control" placeholder="의료진 이름 또는 로그인 ID" value={filters.memberKeyword} onChange={(e) => updateFilter("memberKeyword", e.target.value)} /></div>
        <div className="col-md-4"><input className="form-control" placeholder="환자 ID" value={filters.patientId} onChange={(e) => updateFilter("patientId", e.target.value)} /></div>
        <div className="col-md-4"><input className="form-control" placeholder="Study 번호 또는 UID" value={filters.studyKeyword} onChange={(e) => updateFilter("studyKeyword", e.target.value)} /></div>
        <div className="col-md-3"><select className="form-select" value={filters.departmentNo} onChange={(e) => updateFilter("departmentNo", e.target.value)}><option value="">전체 진료과</option>{departments.map((department) => <option key={department.no} value={department.no}>{department.departmentName}</option>)}</select></div>
        <div className="col-md-3"><select className="form-select" value={filters.dataType} onChange={(e) => updateFilter("dataType", e.target.value)}><option value="">전체 데이터 유형</option><option value="STUDY">STUDY</option><option value="IMAGE">IMAGE</option></select></div>
        <div className="col-md-2"><select className="form-select" value={filters.actionType} onChange={(e) => updateFilter("actionType", e.target.value)}><option value="">전체 행동</option><option value="VIEW">VIEW</option></select></div>
        <div className="col-md-2"><select className="form-select" value={filters.accessResult} onChange={(e) => updateFilter("accessResult", e.target.value)}><option value="">전체 결과</option><option value="SUCCESS">SUCCESS</option><option value="DENIED">DENIED</option></select></div>
        <div className="col-md-2"><input type="date" className="form-control" value={filters.startDate} onChange={(e) => updateFilter("startDate", e.target.value)} /></div>
        <div className="col-md-2"><input type="date" className="form-control" value={filters.endDate} onChange={(e) => updateFilter("endDate", e.target.value)} /></div>
        <div className="col-md-2 d-flex gap-2"><button className="btn btn-primary flex-fill">검색</button><button type="button" className="btn btn-outline-secondary flex-fill" onClick={reset}>초기화</button></div>
      </div>
    </form>
    {message && <div className="alert alert-info">{message}</div>}
    <div className="table-responsive"><table className="table table-hover align-middle">
      <thead><tr><th>접근 시간</th><th>의료진</th><th>진료과</th><th>환자 ID</th><th>Study</th><th>유형</th><th>행동</th><th>결과</th><th>IP</th><th>상세</th></tr></thead>
      <tbody>{logPage.content.length ? logPage.content.map((log) => <tr key={log.logNo}>
        <td>{formatDateTime(log.accessedAt)}</td><td>{log.memberName} ({log.loginId})</td><td>{log.departmentName || "-"}</td>
        <td>{log.patientId || (log.patientNo ? `#${log.patientNo}` : "-")}</td>
        <td>{log.studyNo ? `#${log.studyNo}` : "-"}</td><td>{log.dataType}</td><td>{log.actionType}</td>
        <td><span className={`badge ${log.accessResult === "SUCCESS" ? "text-bg-success" : "text-bg-danger"}`}>{log.accessResult}</span></td><td>{log.ipAddress || "-"}</td>
        <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/admin/access-logs/${log.logNo}`)}>상세</button></td>
      </tr>) : <tr><td colSpan="10" className="text-center text-muted">조회된 접근 이력이 없습니다.</td></tr>}</tbody>
    </table></div>
    <AdminPagination
      page={logPage.number || 0}
      totalPages={logPage.totalPages || 0}
      totalElements={logPage.totalElements || 0}
      onPageChange={(page) => loadLogs(page).catch((error) => setMessage(error.response?.data?.message || "페이지를 불러오지 못했습니다."))}
    />
  </div>;
}
