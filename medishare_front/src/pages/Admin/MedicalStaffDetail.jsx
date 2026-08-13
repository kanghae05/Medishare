import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../components/common/api";

export default function MedicalStaffDetail({ isAdmin }) {
  const { memberNo } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([api.get(`/api/admin/medical-staff/${memberNo}`), api.get("/member/departments.do")])
      .then(([detail, departmentResponse]) => { setStaff(detail.data); setDepartments(departmentResponse.data); })
      .catch(() => setMessage("의료진 정보를 불러오지 못했습니다."));
  }, [isAdmin, memberNo]);

  if (!isAdmin) return <Navigate to="/" replace />;
  if (!staff) return <div>{message || "불러오는 중..."}</div>;

  const updateField = (field, value) => setStaff((current) => ({ ...current, [field]: value }));
  const save = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put(`/api/admin/medical-staff/${memberNo}`, {
        name: staff.name, email: staff.email, tel: staff.tel, departmentNo: Number(staff.departmentNo),
        position: staff.position, specialty: staff.specialty, status: staff.status,
      });
      setStaff(response.data);
      navigate("/admin/medical-staff");
    } catch (error) { setMessage(error.response?.data?.message || "저장하지 못했습니다."); }
  };
  return <div>
    <div className="d-flex justify-content-between align-items-center mb-3"><h2>의료진 상세</h2><Link className="btn btn-outline-secondary" to="/admin/medical-staff">목록으로</Link></div>
    {message && <div className="alert alert-info">{message}</div>}
    <form className="card card-body" onSubmit={save}>
      <p className="text-muted">회원번호 {staff.memberNo} · 로그인 ID {staff.loginId} (로그인 ID와 비밀번호는 변경할 수 없습니다.)</p>
      <div className="row g-3">
        <div className="col-md-4"><label className="form-label">이름</label><input required className="form-control" value={staff.name || ""} onChange={(e) => updateField("name", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">이메일</label><input required type="email" className="form-control" value={staff.email || ""} onChange={(e) => updateField("email", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">전화번호</label><input className="form-control" value={staff.tel || ""} onChange={(e) => updateField("tel", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">진료과</label><select required className="form-select" value={staff.departmentNo || ""} onChange={(e) => updateField("departmentNo", e.target.value)}>{departments.map((department) => <option key={department.no} value={department.no}>{department.departmentName}</option>)}</select></div>
        <div className="col-md-4"><label className="form-label">직위</label><input className="form-control" value={staff.position || ""} onChange={(e) => updateField("position", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">전문분야</label><input className="form-control" value={staff.specialty || ""} onChange={(e) => updateField("specialty", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">상태</label><select className="form-select" value={staff.status || "ACTIVE"} onChange={(e) => updateField("status", e.target.value)}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option><option value="SUSPENDED">SUSPENDED</option></select></div>
      </div>
      <div className="mt-3"><button className="btn btn-primary">저장</button></div>
    </form>
  </div>;
}
