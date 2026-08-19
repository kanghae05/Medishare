import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MemberWrite() {
  const [form, setForm] = useState({ id: "", pw: "", pw2: "", name: "", email: "", tel: "", departmentNo: "", position: "" });
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("id")?.focus();
    axios.get("http://10.15.21.45:8080/member/departments.do")
      .then((response) => setDepartments(response.data))
      .catch(() => alert("진료과 목록을 불러오지 못했습니다."));
  }, []);

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.pw !== form.pw2) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      setForm({ ...form, pw: "", pw2: "" });
      document.getElementById("pw")?.focus();
      return;
    }
    const data = { ...form };
    delete data.pw2;
    data.departmentNo = Number(data.departmentNo);
    try {
      const response = await axios.post("http://10.15.21.45:8080/member/write.do", data);
      if (response.data.success) {
        alert("회원가입이 완료되었습니다.");
        navigate("/member/login");
      }
    } catch (error) {
      alert(error.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  return <section className="container mt-4" style={{ maxWidth: "640px" }}>
    <h2>회원가입</h2>
    <p className="text-muted">의료진 정보를 입력해 계정을 생성합니다. 신규 가입 계정은 일반 사용자 권한으로 등록됩니다.</p>
    <form onSubmit={handleSubmit}>
      <Field label="로그인 ID" name="id" value={form.id} onChange={change} maxLength="100" required />
      <Field label="비밀번호" name="pw" value={form.pw} onChange={change} type="password" required />
      <Field label="비밀번호 확인" name="pw2" value={form.pw2} onChange={change} type="password" required />
      <Field label="이름" name="name" value={form.name} onChange={change} maxLength="200" required />
      <Field label="이메일" name="email" value={form.email} onChange={change} type="email" maxLength="200" required />
      <Field label="전화번호" name="tel" value={form.tel} onChange={change} maxLength="30" />
      <div className="mb-3"><label htmlFor="departmentNo" className="form-label">진료과 *</label>
        <select id="departmentNo" name="departmentNo" className="form-select" value={form.departmentNo} onChange={change} required>
          <option value="">진료과를 선택하세요</option>
          {departments.map((department) => <option key={department.no} value={department.no}>{department.departmentName}</option>)}
        </select>
      </div>
      <div className="mb-3"><label htmlFor="position" className="form-label">직위 *</label>
        <select id="position" name="position" className="form-select" value={form.position} onChange={change} required>
          <option value="">직위를 선택하세요</option>
          <option value="전문의">전문의</option>
          <option value="전공의">전공의</option>
        </select>
      </div>
      <button className="btn btn-primary me-2" type="submit">가입</button>
      <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/")}>취소</button>
    </form>
  </section>;
}

function Field({ label, name, type = "text", ...props }) {
  return <div className="mb-3"><label htmlFor={name} className="form-label">{label}{props.required ? " *" : ""}</label>
    <input id={name} name={name} type={type} className="form-control" {...props} />
  </div>;
}

export default MemberWrite;
