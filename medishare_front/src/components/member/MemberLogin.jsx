import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Member.css";

function MemberLogin() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("id")?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const data = { id, pw };

    try {
      const response = await axios.post(
        `http://${window.location.hostname}/member/login.do`,
        data,
      );
      const result = response.data;

      if (result.success) {
        const token = result.token;
        const login = jwtDecode(token);

        localStorage.setItem("token", token);
        localStorage.setItem("login", JSON.stringify(login));

        alert(`${login.name}님으로 로그인되었습니다.`);
        location.href = "/";
      } else {
        setMessage(result.message || "아이디 또는 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "로그인 처리 중 오류가 발생했습니다.",
      );
    }
  };

  return (
    <section className="member-auth-page">
      <div className="member-auth-hero">
        <span className="member-auth-eyebrow">MEDISHARE LOGIN</span>
        <h1>의료협업 서비스를 시작하세요</h1>
        <p>
          PACS 영상 조회, 판독소견 작성, 협진 요청과 진행 상황을 하나의
          계정으로 안전하게 이용할 수 있습니다.
        </p>
      </div>

      <div className="member-auth-card">
        <div className="member-auth-card-head">
          <span>ACCOUNT</span>
          <h2>로그인</h2>
          <p>발급받은 계정 정보로 접속해주세요.</p>
        </div>

        {message && <div className="member-auth-alert">{message}</div>}

        <form className="member-auth-form" onSubmit={handleSubmit}>
          <label htmlFor="id">
            아이디
            <input
              type="text"
              id="id"
              name="id"
              placeholder="아이디를 입력하세요"
              required
              maxLength={20}
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </label>

          <label htmlFor="pw">
            비밀번호
            <input
              type="password"
              id="pw"
              name="pw"
              placeholder="비밀번호를 입력하세요"
              required
              maxLength={20}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </label>

          <div className="member-auth-actions">
            <button type="submit">로그인</button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setId("");
                setPw("");
                setMessage("");
                document.getElementById("id")?.focus();
              }}
            >
              다시 입력
            </button>
          </div>
        </form>

        <div className="member-auth-foot">
          <span>계정이 없으신가요?</span>
          <Link to="/member/write">회원가입</Link>
        </div>

        <button
          type="button"
          className="member-auth-home"
          onClick={() => navigate("/")}
        >
          홈으로 돌아가기
        </button>
      </div>
    </section>
  );
}

export default MemberLogin;
