import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../components/common/api";

const initialFilters = {
  memberKeyword: "", patientId: "", studyKeyword: "", departmentNo: "",
  dataType: "", actionType: "", startDate: "", endDate: "",
};

const formatDateTime = (value) => value ? new Date(value).toLocaleString("ko-KR") : "-";

export default function ChangeHistoryManagement({ isAdmin }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [departments, setDepartments] = useState([]);
  const [historyPage, setHistoryPage] = useState({ content: [], totalPages: 0, number: 0 });
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
    api.get("/member/departments.do").then((response) => setDepartments(response.data)).catch(() => setDepartments([]));
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) loadHistories().catch((error) => setMessage(error.response?.data?.message || "변경 이력 목록을 불러오지 못했습니다."));
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

  return <div>
    <h2 className="mb-3">의료 데이터 변경 이력</h2>
    <form className="card card-body mb-3" onSubmit={search}>
      <div className="row g-2">
        <div className="col-md-4"><input className="form-control" placeholder="의료진 이름 또는 로그인 ID" value={filters.memberKeyword} onChange={(e) => updateFilter("memberKeyword", e.target.value)} /></div>
        <div className="col-md-4"><input className="form-control" placeholder="환자 ID" value={filters.patientId} onChange={(e) => updateFilter("patientId", e.target.value)} /></div>
        <div className="col-md-4"><input className="form-control" placeholder="Study 번호 또는 UID" value={filters.studyKeyword} onChange={(e) => updateFilter("studyKeyword", e.target.value)} /></div>
        <div className="col-md-3"><select className="form-select" value={filters.departmentNo} onChange={(e) => updateFilter("departmentNo", e.target.value)}><option value="">전체 진료과</option>{departments.map((department) => <option key={department.no} value={department.no}>{department.departmentName}</option>)}</select></div>
        <div className="col-md-3"><select className="form-select" value={filters.dataType} onChange={(e) => updateFilter("dataType", e.target.value)}><option value="">전체 데이터 유형</option><option value="REPORT">REPORT</option></select></div>
        <div className="col-md-2"><select className="form-select" value={filters.actionType} onChange={(e) => updateFilter("actionType", e.target.value)}><option value="">전체 변경</option><option value="CREATE">CREATE</option><option value="UPDATE">UPDATE</option><option value="DELETE">DELETE</option></select></div>
        <div className="col-md-2"><input type="date" className="form-control" value={filters.startDate} onChange={(e) => updateFilter("startDate", e.target.value)} /></div>
        <div className="col-md-2"><input type="date" className="form-control" value={filters.endDate} onChange={(e) => updateFilter("endDate", e.target.value)} /></div>
        <div className="col-md-2 d-flex gap-2"><button className="btn btn-primary flex-fill">검색</button><button type="button" className="btn btn-outline-secondary flex-fill" onClick={reset}>초기화</button></div>
      </div>
    </form>
    {message && <div className="alert alert-info">{message}</div>}
    <div className="table-responsive"><table className="table table-hover align-middle">
      <thead><tr><th>변경 시간</th><th>변경자</th><th>진료과</th><th>환자 ID</th><th>Study</th><th>유형</th><th>변경</th><th>사유</th><th>상세</th></tr></thead>
      <tbody>{historyPage.content.length ? historyPage.content.map((history) => <tr key={history.historyNo}>
        <td>{formatDateTime(history.changedAt)}</td><td>{history.memberName} ({history.loginId})</td><td>{history.departmentName || "-"}</td>
        <td>{history.patientId || (history.patientNo ? `#${history.patientNo}` : "-")}</td><td>{history.studyNo ? `#${history.studyNo}` : "-"}</td>
        <td>{history.dataType}</td><td>{history.actionType}</td><td>{history.changeReason || "-"}</td>
        <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/admin/change-logs/${history.historyNo}`)}>상세</button></td>
      </tr>) : <tr><td colSpan="9" className="text-center text-muted">조회된 변경 이력이 없습니다.</td></tr>}</tbody>
    </table></div>
    <div>{Array.from({ length: historyPage.totalPages || 0 }, (_, page) => <button type="button" key={page} className={`btn btn-sm me-1 ${page === historyPage.number ? "btn-primary" : "btn-outline-primary"}`} onClick={() => loadHistories(page).catch((error) => setMessage(error.response?.data?.message || "페이지를 불러오지 못했습니다."))}>{page + 1}</button>)}</div>
  </div>;
}
