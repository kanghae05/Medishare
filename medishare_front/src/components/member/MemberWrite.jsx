import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Member.css";

function MemberWrite() {
  const [form, setForm] = useState({
    id: "",
    pw: "",
    pw2: "",
    name: "",
    email: "",
    tel: "",
    departmentNo: "",
    position: "",
  });
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("id")?.focus();
    axios
      .get("http://10.15.21.45:8080/member/departments.do")
      .then((response) => setDepartments(response.data))
      .catch(() => setMessage("진료과 목록을 불러오지 못했습니다."));
  }, []);

  const change = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (form.pw !== form.pw2) {
      setMessage("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      setForm({ ...form, pw: "", pw2: "" });
      document.getElementById("pw")?.focus();
      return;
    }

    const data = { ...form };
    delete data.pw2;
    data.departmentNo = Number(data.departmentNo);

    try {
      const response = await axios.post(
        "http://10.15.21.45:8080/member/write.do",
        data,
      );

      if (response.data.success) {
        alert("회원가입이 완료되었습니다.");
        navigate("/member/login");
      } else {
        setMessage(response.data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <section className="member-auth-page signup">
      <div className="member-auth-hero">
        <span className="member-auth-eyebrow">MEDISHARE JOIN</span>
        <h1>의료진 계정을 등록하세요</h1>
        <p>
          진료과와 직위를 선택해 의료영상 판독과 협진 업무에 사용할 계정을
          생성합니다.
        </p>
      </div>

      <div className="member-auth-card wide">
        <div className="member-auth-card-head">
          <span>NEW ACCOUNT</span>
          <h2>회원가입</h2>
          <p>의료진 기본 정보를 입력해주세요.</p>
        </div>

        {message && <div className="member-auth-alert">{message}</div>}

        <form className="member-auth-form signup" onSubmit={handleSubmit}>
          <Field
            label="로그인 ID"
            name="id"
            value={form.id}
            onChange={change}
            maxLength="100"
            required
          />
          <Field
            label="비밀번호"
            name="pw"
            value={form.pw}
            onChange={change}
            type="password"
            required
          />
          <Field
            label="비밀번호 확인"
            name="pw2"
            value={form.pw2}
            onChange={change}
            type="password"
            required
          />
          <Field
            label="이름"
            name="name"
            value={form.name}
            onChange={change}
            maxLength="200"
            required
          />
          <Field
            label="이메일"
            name="email"
            value={form.email}
            onChange={change}
            type="email"
            maxLength="200"
            required
          />
          <Field
            label="전화번호"
            name="tel"
            value={form.tel}
            onChange={change}
            maxLength="30"
          />

          <label htmlFor="departmentNo">
            진료과
            <select
              id="departmentNo"
              name="departmentNo"
              value={form.departmentNo}
              onChange={change}
              required
            >
              <option value="">진료과를 선택하세요</option>
              {departments.map((department) => (
                <option key={department.no} value={department.no}>
                  {department.departmentName}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="position">
            직위
            <select
              id="position"
              name="position"
              value={form.position}
              onChange={change}
              required
            >
              <option value="">직위를 선택하세요</option>
              <option value="전문의">전문의</option>
              <option value="전공의">전공의</option>
            </select>
          </label>

          <div className="member-auth-actions full">
            <button type="submit">가입하기</button>
            <button
              type="button"
              className="secondary"
              onClick={() => navigate("/")}
            >
              취소
            </button>
          </div>
        </form>

        <div className="member-auth-foot">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/member/login">로그인</Link>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", required, ...props }) {
  return (
    <label htmlFor={name}>
      {label}
      {required ? <em>*</em> : null}
      <input id={name} name={name} type={type} required={required} {...props} />
    </label>
  );
}

export default MemberWrite;
