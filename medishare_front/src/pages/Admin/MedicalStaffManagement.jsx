import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../../components/common/api";

const emptyFilters = { keyword: "", departmentNo: "", status: "" };

export default function MedicalStaffManagement({ isAdmin }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(emptyFilters);
  const [departments, setDepartments] = useState([]);
  const [staffPage, setStaffPage] = useState({ content: [], totalPages: 0, number: 0 });
  const [selected, setSelected] = useState(null);
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
    api.get("/member/departments.do").then((response) => setDepartments(response.data)).catch(() => setDepartments([]));
  }, [isAdmin]);

  useEffect(() => { if (isAdmin) loadStaff().catch(() => setMessage("의료진 목록을 불러오지 못했습니다.")); }, [isAdmin]);

  const selectStaff = (memberNo) => navigate(`/admin/medical-staff/${memberNo}`);
  /*
    try {
      const response = await api.get(`/api/admin/medical-staff/${memberNo}`);
      setSelected(response.data);
      setMessage("");
    } catch { setMessage("의료진 상세 정보를 불러오지 못했습니다."); }
  };

  */
  const updateSelected = (field, value) => setSelected((current) => ({ ...current, [field]: value }));
  const save = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put(`/api/admin/medical-staff/${selected.memberNo}`, {
        name: selected.name, email: selected.email, tel: selected.tel,
        departmentNo: Number(selected.departmentNo), position: selected.position,
        specialty: selected.specialty, status: selected.status,
      });
      setSelected(response.data);
      setMessage("의료진 정보를 저장했습니다.");
      loadStaff(staffPage.number);
    } catch (error) { setMessage(error.response?.data?.message || "저장하지 못했습니다."); }
  };

  const toggleStatus = async () => {
    const status = selected.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const response = await api.patch(`/api/admin/medical-staff/${selected.memberNo}/status`, { status });
      setSelected(response.data);
      setMessage(`계정을 ${status} 상태로 변경했습니다.`);
      loadStaff(staffPage.number);
    } catch (error) { setMessage(error.response?.data?.message || "상태를 변경하지 못했습니다."); }
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  return <div>
    <h2>의료진 관리</h2>
    <form className="row g-2 mb-3" onSubmit={(event) => { event.preventDefault(); loadStaff().catch(() => setMessage("검색하지 못했습니다.")); }}>
      <div className="col-md-4"><input className="form-control" placeholder="이름, 로그인 ID, 이메일 검색" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} /></div>
      <div className="col-md-3"><select className="form-select" value={filters.departmentNo} onChange={(e) => setFilters({ ...filters, departmentNo: e.target.value })}><option value="">전체 진료과</option>{departments.map((department) => <option key={department.no} value={department.no}>{department.departmentName}</option>)}</select></div>
      <div className="col-md-3"><select className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">전체 상태</option><option value="ACTIVE">활성화</option><option value="INACTIVE">비활성화</option></select></div>
      <div className="col-md-2"><button className="btn btn-primary w-100">검색</button></div>
    </form>
    {message && <div className="alert alert-info">{message}</div>}
    <div className="table-responsive"><table className="table table-hover">
      <thead><tr><th>번호</th><th>로그인 ID</th><th>이름</th><th>이메일</th><th>전화</th><th>진료과</th><th>직위</th><th>전문분야</th><th>상태</th><th>관리</th></tr></thead>
      <tbody>{staffPage.content.map((staff) => <tr key={staff.memberNo}><td>{staff.memberNo}</td><td>{staff.loginId}</td><td>{staff.name}</td><td>{staff.email}</td><td>{staff.tel}</td><td>{staff.departmentName || "-"}</td><td>{staff.position || "-"}</td><td>{staff.specialty || "-"}</td><td>{staff.status === "ACTIVE" ? "활성화" : "비활성화"}</td><td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => selectStaff(staff.memberNo)}>상세</button></td></tr>)}</tbody>
    </table></div>
    <div className="mb-4">{Array.from({ length: staffPage.totalPages || 0 }, (_, page) => <button key={page} className={`btn btn-sm me-1 ${page === staffPage.number ? "btn-primary" : "btn-outline-primary"}`} onClick={() => loadStaff(page)}>{page + 1}</button>)}</div>
    {selected && <form className="card card-body" onSubmit={save}>
      <h4>의료진 상세</h4><p className="text-muted mb-2">회원번호 {selected.memberNo} · 로그인 ID {selected.loginId} (로그인 ID와 비밀번호는 여기서 변경할 수 없습니다.)</p>
      <div className="row g-3">
        <div className="col-md-4"><label className="form-label">이름</label><input required className="form-control" value={selected.name || ""} onChange={(e) => updateSelected("name", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">이메일</label><input required type="email" className="form-control" value={selected.email || ""} onChange={(e) => updateSelected("email", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">전화번호</label><input className="form-control" value={selected.tel || ""} onChange={(e) => updateSelected("tel", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">진료과</label><select required className="form-select" value={selected.departmentNo || ""} onChange={(e) => updateSelected("departmentNo", e.target.value)}>{departments.map((department) => <option key={department.no} value={department.no}>{department.departmentName}</option>)}</select></div>
        <div className="col-md-4"><label className="form-label">직위</label><input className="form-control" value={selected.position || ""} onChange={(e) => updateSelected("position", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">전문분야</label><input className="form-control" value={selected.specialty || ""} onChange={(e) => updateSelected("specialty", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">상태</label><select className="form-select" value={selected.status || "ACTIVE"} onChange={(e) => updateSelected("status", e.target.value)}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="SUSPENDED">SUSPENDED</option></select></div>
      </div>
      <div className="mt-3"><button className="btn btn-primary me-2">저장</button><button type="button" className="btn btn-outline-danger" onClick={toggleStatus}>{selected.status === "ACTIVE" ? "비활성화" : "활성화"}</button></div>
    </form>}
  </div>;
}
