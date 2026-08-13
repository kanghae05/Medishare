import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const getStoredLogin = () => {
  try {
    return JSON.parse(localStorage.getItem("login")) ?? null;
  } catch {
    return null;
  }
};

function TopNavi() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [login, setLogin] = useState(getStoredLogin);
  const isLoggedIn = Boolean(token);
  const isAdmin = login?.roles?.some((role) => role === "ADMIN" || role === "ROLE_ADMIN");

  const logout = (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("login");
    setToken(null);
    setLogin(null);
    alert("로그아웃 되었습니다.");
    location.href = "/";
  };

  return (
    <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mynavbar">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/" className="nav-link">Home</NavLink>
            </li>
            {isLoggedIn && (
              <li className="nav-item">
                <NavLink to="/d/dashboard" className="nav-link">Dashboard</NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin/medical-staff" className="nav-link">의료진 관리</NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink to="/notices" className="nav-link">
                공지사항
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/special-cases" className="nav-link">
                특이케이스
              </NavLink>
            </li>
            {isLoggedIn && (
              <>
                <li className="nav-item"><NavLink to="/report/list" className="nav-link">판독소견</NavLink></li>
                <li className="nav-item"><NavLink to="/coop/received" className="nav-link">협진</NavLink></li>
              </>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {!isLoggedIn ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/member/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/member/write">Join</Link></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/member/logout" onClick={logout}>Logout</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/member/view">{login?.name || "사용자"}</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default TopNavi;
