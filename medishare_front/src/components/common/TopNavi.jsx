import { useState } from "react";
import { Link, NavLink } from "react-router-dom"

function TopNavi(){

  const [token, setToken] = useState(localStorage.getItem("token"));

  // JWT 내부 정보
  const [login, setLogin] = useState(() => {
    const data = localStorage.getItem("login"); // 문자열이므로
    return data ? JSON.parse(data) : null; // JSON 데이터로 만들어 준다.
  });
 
  console.log("TopNavi login = " + login);
  console.log(login?"TopNavi login.name = " + login.name:'없음');

  // 로그아웃 처리
  const logout = (e) => {
    e.preventDefault();

    // react에서만 token과 사용자 정보를 지운다.
    localStorage.removeItem("token");
    localStorage.removeItem("login");

    setToken(null);
    setLogin(null);

    alert("로그아웃 되었습니다.");
    // Navigate("/");
    location.href = "/";
}

  return(
    <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mynavbar">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to={"/"} className="nav-link">Home</NavLink>&nbsp;
            </li>

          </ul>
          <ul className="navbar-nav ms-auto">
              {!token && (
                  <>
                      <li className="nav-item">
                          <Link className="nav-link" to="/member/login">
                              Login
                          </Link>
                      </li>

                      <li className="nav-item">
                          <Link className="nav-link" to="/member/write">
                              Join
                          </Link>
                      </li>

                      <li className="nav-item">
                          <Link className="nav-link" to="/member/find-id">
                              아이디찾기
                          </Link>
                      </li>
                  </>
              )}

              {token && (
                  <>
                      <li className="nav-item">
                          <Link className="nav-link" to="/member/logout" onClick={logout}>
                              Logout
                          </Link>
                      </li>

                      <li className="nav-item">
                          <Link className="nav-link" to="/member/view">
                              {login.name}
                          </Link>
                      </li>

                  </>
              )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default TopNavi;