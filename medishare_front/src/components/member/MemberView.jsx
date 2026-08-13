import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../common/api";

const blankPassword = { currentPassword: "", newPassword: "", newPasswordConfirm: "" };

export default function MemberView() {
  const [member, setMember] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [password, setPassword] = useState(blankPassword);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const hasToken = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!hasToken) return;
    Promise.all([api.get("/member/view"), api.get("/member/departments.do")])
      .then(([memberResponse, departmentResponse]) => {
        setMember(memberResponse.data);
        setDepartments(departmentResponse.data);
      })
      .catch(() => setError("회원 정보를 불러오지 못했습니다."));
  }, [hasToken]);

  if (!hasToken) return <Navigate to="/member/login" replace />;
  if (!member) return <div className="mt-4">{error || "회원 정보를 불러오는 중입니다."}</div>;

  const updateMember = (field, value) => setMember((current) => ({ ...current, [field]: value }));
  const saveProfile = async (event) => {
    event.preventDefault(); setMessage(""); setError("");
    try {
      const response = await api.put("/member/view", {
        name: member.name, email: member.email, tel: member.tel, departmentNo: Number(member.departmentNo),
        position: member.position, specialty: member.specialty,
      });
      setMember(response.data);
      setMessage("회원 정보가 수정되었습니다.");
    } catch (requestError) { setError(requestError.response?.data?.message || "회원 정보를 수정하지 못했습니다."); }
  };
  const changePassword = async (event) => {
    event.preventDefault(); setMessage(""); setError("");
    if (password.newPassword !== password.newPasswordConfirm) { setError("새 비밀번호와 확인 값이 일치하지 않습니다."); return; }
    try {
      await api.put("/member/password", password);
      setPassword(blankPassword);
      setMessage("비밀번호가 변경되었습니다.");
    } catch (requestError) { setError(requestError.response?.data?.message || "비밀번호를 변경하지 못했습니다."); }
  };

  return <div className="mt-4">
    <h2>마이페이지</h2>
    {message && <div className="alert alert-success">{message}</div>}
    {error && <div className="alert alert-danger">{error}</div>}
    <section className="card card-body mb-4">
      <h4>프로필 회원 정보</h4>
      <dl className="row mb-0">
        <dt className="col-sm-3">회원번호</dt><dd className="col-sm-9">{member.memberNo}</dd>
        <dt className="col-sm-3">로그인 ID</dt><dd className="col-sm-9">{member.loginId}</dd>
        <dt className="col-sm-3">계정 상태</dt><dd className="col-sm-9">{member.status === "ACTIVE" ? "활성화" : "비활성화"}</dd>
      </dl>
    </section>
    <form className="card card-body mb-4" onSubmit={saveProfile}>
      <h4>회원 정보 수정</h4>
      <div className="row g-3">
        <div className="col-md-4"><label className="form-label">이름</label><input required className="form-control" value={member.name || ""} onChange={(e) => updateMember("name", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">이메일</label><input required type="email" className="form-control" value={member.email || ""} onChange={(e) => updateMember("email", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">전화번호</label><input className="form-control" value={member.tel || ""} onChange={(e) => updateMember("tel", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">진료과</label><select required className="form-select" value={member.departmentNo || ""} onChange={(e) => updateMember("departmentNo", e.target.value)}><option value="">진료과 선택</option>{departments.map((department) => <option key={department.no} value={department.no}>{department.departmentName}</option>)}</select></div>
        <div className="col-md-4"><label className="form-label">직위</label><input className="form-control" value={member.position || ""} onChange={(e) => updateMember("position", e.target.value)} /></div>
        <div className="col-md-4"><label className="form-label">전문분야</label><input className="form-control" value={member.specialty || ""} onChange={(e) => updateMember("specialty", e.target.value)} /></div>
      </div>
      <div className="mt-3"><button className="btn btn-primary">저장</button></div>
    </form>
    <form className="card card-body" onSubmit={changePassword}>
      <h4>비밀번호 변경</h4>
      <div className="row g-3">
        <div className="col-md-4"><label className="form-label">현재 비밀번호</label><input required type="password" className="form-control" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} /></div>
        <div className="col-md-4"><label className="form-label">새 비밀번호</label><input required type="password" className="form-control" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} /></div>
        <div className="col-md-4"><label className="form-label">새 비밀번호 확인</label><input required type="password" className="form-control" value={password.newPasswordConfirm} onChange={(e) => setPassword({ ...password, newPasswordConfirm: e.target.value })} /></div>
      </div>
      <div className="mt-3"><button className="btn btn-outline-primary">비밀번호 변경</button></div>
    </form>
  </div>;
}
