import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../components/common/api";
import "./AdminAudit.css";

const emptyFilters = { keyword: "", departmentNo: "", status: "" };

const statusLabel = {
  ACTIVE: "활성화",
  INACTIVE: "비활성화",
  SUSPENDED: "정지",
};

export default function MedicalStaffManagement({ isAdmin }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(emptyFilters);
  const [departments, setDepartments] = useState([]);
  const [staffPage, setStaffPage] = useState({
    content: [],
    totalPages: 0,
    number: 0,
    totalElements: 0,
  });
  const [message, setMessage] = useState("");

  const loadStaff = async (page = 0) => {
    const params = { page, size: 10, sort: "no,asc" };
    if (filters.keyword.trim()) params.keyword = filters.keyword.trim();
    if (filters.departmentNo) params.departmentNo = filters.departmentNo;
    if (filters.status) params.status = filters.status;

    const response = await api.get("/api/admin/medical-staff", { params });
    setStaffPage(response.data);
  };

  useEffect(() => {
    if (!isAdmin) return;
    api
      .get("/member/departments.do")
      .then((response) => setDepartments(response.data))
      .catch(() => setDepartments([]));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    loadStaff().catch(() => setMessage("의료진 목록을 불러오지 못했습니다."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const submitSearch = (event) => {
    event.preventDefault();
    loadStaff().catch(() => setMessage("검색하지 못했습니다."));
  };

  const resetSearch = () => {
    setFilters(emptyFilters);
    setTimeout(() => {
      loadStaff().catch(() => setMessage("의료진 목록을 불러오지 못했습니다."));
    }, 0);
  };

  return (
    <section className="admin-audit-page">
      <div className="admin-audit-hero">
        <div>
          <span className="admin-audit-eyebrow">MEDICAL STAFF</span>
          <h1>의료진 관리</h1>
          <p>의료진 계정, 진료과, 직위와 계정 상태를 조회합니다.</p>
        </div>
        <div className="admin-audit-hero-card">
          <span>TOTAL STAFF</span>
          <strong>
            {Number(staffPage.totalElements || staffPage.content.length || 0).toLocaleString()}
          </strong>
          <small>검색 조건 기준</small>
        </div>
      </div>

      <form className="admin-audit-filter staff" onSubmit={submitSearch}>
        <input
          placeholder="이름, 로그인 ID, 이메일 검색"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <select
          value={filters.departmentNo}
          onChange={(e) => setFilters({ ...filters, departmentNo: e.target.value })}
        >
          <option value="">전체 진료과</option>
          {departments.map((department) => (
            <option key={department.no} value={department.no}>
              {department.departmentName}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">전체 상태</option>
          <option value="ACTIVE">활성화</option>
          <option value="INACTIVE">비활성화</option>
          <option value="SUSPENDED">정지</option>
        </select>
        <div className="admin-audit-actions">
          <button type="submit">검색</button>
          <button type="button" onClick={resetSearch}>
            초기화
          </button>
        </div>
      </form>

      {message && <div className="admin-audit-alert">{message}</div>}

      <div className="admin-audit-table-card">
        <div className="admin-audit-table-head">
          <div>
            <span>STAFF LIST</span>
            <h2>의료진 목록</h2>
          </div>
        </div>

        <div className="admin-audit-table-wrap">
          <table className="admin-audit-table">
            <thead>
              <tr>
                <th>번호</th>
                <th>로그인 ID</th>
                <th>이름</th>
                <th>이메일</th>
                <th>전화</th>
                <th>진료과</th>
                <th>직위</th>
                <th>전문분야</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {staffPage.content.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="admin-audit-empty compact">
                      조건에 맞는 의료진이 없습니다.
                    </div>
                  </td>
                </tr>
              ) : (
                staffPage.content.map((staff) => (
                  <tr key={staff.memberNo}>
                    <td>{staff.memberNo}</td>
                    <td>
                      <strong>{staff.loginId}</strong>
                    </td>
                    <td>{staff.name}</td>
                    <td>{staff.email}</td>
                    <td>{staff.tel || "-"}</td>
                    <td>{staff.departmentName || "-"}</td>
                    <td>{staff.position || "-"}</td>
                    <td>{staff.specialty || "-"}</td>
                    <td>
                      <span
                        className={`admin-audit-badge ${
                          staff.status === "ACTIVE" ? "success" : "danger"
                        }`}
                      >
                        {statusLabel[staff.status] || staff.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-audit-table-button"
                        onClick={() => navigate(`/admin/medical-staff/${staff.memberNo}`)}
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {staffPage.totalPages > 1 && (
        <div className="admin-audit-pagination">
          {Array.from({ length: staffPage.totalPages }, (_, page) => (
            <button
              key={page}
              type="button"
              className={page === staffPage.number ? "active" : ""}
              onClick={() => loadStaff(page)}
            >
              {page + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
