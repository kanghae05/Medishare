import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../components/common/api";
import "./AdminAudit.css";

export default function MedicalStaffDetail({ isAdmin }) {
  const { memberNo } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    Promise.all([
      api.get(`/api/admin/medical-staff/${memberNo}`),
      api.get("/member/departments.do"),
    ])
      .then(([detail, departmentResponse]) => {
        setStaff(detail.data);
        setDepartments(departmentResponse.data);
      })
      .catch(() => setMessage("의료진 정보를 불러오지 못했습니다."));
  }, [isAdmin, memberNo]);

  if (!isAdmin) return <Navigate to="/" replace />;

  if (!staff) {
    return (
      <section className="admin-audit-page">
        <div className="admin-audit-loading">
          {message || "의료진 정보를 불러오는 중입니다."}
        </div>
      </section>
    );
  }

  const updateField = (field, value) =>
    setStaff((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/api/admin/medical-staff/${memberNo}`, {
        name: staff.name,
        email: staff.email,
        tel: staff.tel,
        departmentNo: Number(staff.departmentNo),
        position: staff.position,
        specialty: staff.specialty,
        status: staff.status,
      });
      navigate("/admin/medical-staff");
    } catch (error) {
      setMessage(error.response?.data?.message || "저장하지 못했습니다.");
    }
  };

  return (
    <section className="admin-audit-page">
      <div className="admin-audit-hero compact">
        <div>
          <span className="admin-audit-eyebrow">STAFF DETAIL</span>
          <h1>의료진 상세</h1>
          <p>
            회원번호 {staff.memberNo} · 로그인 ID {staff.loginId}
            <br />
            로그인 ID와 비밀번호는 이 화면에서 변경할 수 없습니다.
          </p>
        </div>
        <Link className="admin-audit-back" to="/admin/medical-staff">
          목록으로
        </Link>
      </div>

      {message && <div className="admin-audit-alert">{message}</div>}

      <form className="admin-audit-detail-card admin-staff-form" onSubmit={save}>
        <div className="admin-audit-detail-title">
          <span
            className={`admin-audit-badge ${
              staff.status === "ACTIVE" ? "success" : "danger"
            }`}
          >
            {staff.status || "ACTIVE"}
          </span>
          <h2>{staff.name || "의료진"}</h2>
        </div>

        <div className="admin-staff-form-grid">
          <label>
            이름
            <input
              required
              value={staff.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </label>

          <label>
            이메일
            <input
              required
              type="email"
              value={staff.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </label>

          <label>
            전화번호
            <input
              value={staff.tel || ""}
              onChange={(e) => updateField("tel", e.target.value)}
            />
          </label>

          <label>
            진료과
            <select
              required
              value={staff.departmentNo || ""}
              onChange={(e) => updateField("departmentNo", e.target.value)}
            >
              <option value="">진료과 선택</option>
              {departments.map((department) => (
                <option key={department.no} value={department.no}>
                  {department.departmentName}
                </option>
              ))}
            </select>
          </label>

          <label>
            직위
            <input
              value={staff.position || ""}
              onChange={(e) => updateField("position", e.target.value)}
            />
          </label>

          <label>
            전문분야
            <input
              value={staff.specialty || ""}
              onChange={(e) => updateField("specialty", e.target.value)}
            />
          </label>

          <label>
            계정 상태
            <select
              value={staff.status || "ACTIVE"}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option value="ACTIVE">활성화</option>
              <option value="INACTIVE">비활성화</option>
              <option value="SUSPENDED">정지</option>
            </select>
          </label>
        </div>

        <div className="admin-staff-form-actions">
          <button type="button" className="admin-audit-back" onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit" className="admin-staff-save">
            저장
          </button>
        </div>
      </form>
    </section>
  );
}
