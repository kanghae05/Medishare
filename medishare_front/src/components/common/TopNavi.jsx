import { useState } from "react";
import { Link, NavLink } from "react-router-dom";


// =========================================================
// 로그인 정보 조회
// =========================================================
const getStoredLogin = () => {
  try {
    return JSON.parse(
      localStorage.getItem("login")
    ) ?? null;
  } catch {
    return null;
  }
};


// =========================================================
// Role 값 정규화
// =========================================================
const getRoleNames = (login) => {

  if (!login) {
    return [];
  }


  const roles =
    Array.isArray(login.roles)
      ? login.roles
      : login.role
        ? [login.role]
        : login.roleCode
          ? [login.roleCode]
          : [];


  return roles
    .map((role) => {

      if (typeof role === "string") {
        return role;
      }


      return (
        role?.roleCode
        || role?.role_code
        || role?.role
        || role?.name
        || role?.authority
        || ""
      );

    })
    .filter(Boolean)
    .map((role) =>
      String(role).toUpperCase()
    );
};


// =========================================================
// 관리자 여부
// =========================================================
const isAdminLogin = (login) => {

  const roles =
    getRoleNames(login);


  return (
    roles.includes("ADMIN")
    || roles.includes("ROLE_ADMIN")
  );
};


// =========================================================
// 의료진 여부
// =========================================================
const isDoctorLogin = (login) => {

  const roles =
    getRoleNames(login);


  return (
    roles.includes("USER")
    || roles.includes("ROLE_USER")
    || roles.includes("DOCTOR")
    || roles.includes("ROLE_DOCTOR")
  );
};


function TopNavi() {

  const [token, setToken] =
    useState(
      localStorage.getItem("token")
    );


  const [login, setLogin] =
    useState(
      getStoredLogin
    );


  const isLoggedIn =
    Boolean(token);


  const isAdmin =
    isAdminLogin(login);


  const isDoctor =
    isDoctorLogin(login);


  // 관리자 또는 의료진
  const isMedicalUser =
    isAdmin || isDoctor;


  // =========================================================
  // 로그아웃
  // =========================================================
  const logout = (event) => {

    event.preventDefault();


    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "login"
    );


    setToken(null);
    setLogin(null);
<<<<<<< HEAD
    alert("로그아웃되었습니다.");
=======


    alert(
      "로그아웃 되었습니다."
    );


>>>>>>> 7321583662f0c547219cf9d9519144716d040892
    location.href = "/";
  };


  return (

    <nav
      className="
        navbar
        navbar-expand-sm
        bg-dark
        navbar-dark
        fixed-top
      "
    >

      <div className="container-fluid">


        {/* 모바일 메뉴 버튼 */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mynavbar"
        >

          <span
            className="navbar-toggler-icon"
          />

        </button>


        <div
          className="collapse navbar-collapse"
          id="mynavbar"
        >


          {/* =================================================
              왼쪽 메뉴
          ================================================== */}
          <ul className="navbar-nav me-auto">


            {/* Home */}
            <li className="nav-item">

              <NavLink
                to="/"
                className="nav-link"
              >
                Home
              </NavLink>

            </li>


            {/* Dashboard */}
            {isMedicalUser && (

              <li className="nav-item">

                <NavLink
                  to="/d/dashboard"
                  className="nav-link"
                >
                  Dashboard
                </NavLink>

              </li>

            )}


            {/* PACS */}
            {isMedicalUser && (

              <li className="nav-item">

                <NavLink
                  to="/pacs/list"
                  className="nav-link"
                >
                  PACS
                </NavLink>

              </li>

            )}
<<<<<<< HEAD
            {isAdmin && (
              <>
                <li className="nav-item"><NavLink to="/admin/medical-staff" className="nav-link">의료진 관리</NavLink></li>
                <li className="nav-item"><NavLink to="/admin/access-logs" className="nav-link">접근 이력</NavLink></li>
                <li className="nav-item"><NavLink to="/admin/change-logs" className="nav-link">변경 이력</NavLink></li>
              </>
            )}
            {isLoggedIn && (
=======


            {/* 관리자 전용 */}
            {isAdmin && (

>>>>>>> 7321583662f0c547219cf9d9519144716d040892
              <>

                <li className="nav-item">

                  <NavLink
                    to="/admin/medical-staff"
                    className="nav-link"
                  >
                    의료진 관리
                  </NavLink>

                </li>


                <li className="nav-item">

                  <NavLink
                    to="/admin/access-logs"
                    className="nav-link"
                  >
                    접근 이력
                  </NavLink>

                </li>

              </>

            )}


            {/* 로그인 의료진 / 관리자 공통 */}
            {isMedicalUser && (

              <>

                <li className="nav-item">

                  <NavLink
                    to="/notices"
                    className="nav-link"
                  >
                    공지사항
                  </NavLink>

                </li>


                <li className="nav-item">

                  <NavLink
                    to="/special-cases"
                    className="nav-link"
                  >
                    특이케이스
                  </NavLink>

                </li>


                <li className="nav-item">

                  <NavLink
                    to="/report/list"
                    className="nav-link"
                  >
                    판독소견
                  </NavLink>

                </li>


                <li className="nav-item">

                  <NavLink
                    to="/coop/received"
                    className="nav-link"
                  >
                    협진
                  </NavLink>

                </li>

              </>

            )}

          </ul>


          {/* =================================================
              오른쪽 로그인 메뉴
          ================================================== */}
          <ul className="navbar-nav ms-auto">
<<<<<<< HEAD
            {!isLoggedIn ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/member/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/member/write">Join</Link></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/member/logout" onClick={logout}>Logout</Link></li>
                {isAdmin && <li className="nav-item"><span className="nav-link">관리자</span></li>}
                {!isAdmin && <li className="nav-item"><Link className="nav-link" to="/member/view">{login?.name || "사용자"}</Link></li>}
              </>
            )}
=======


            {!isLoggedIn ? (

              <>

                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/member/login"
                  >
                    Login
                  </Link>

                </li>


                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/member/write"
                  >
                    Join
                  </Link>

                </li>

              </>

            ) : (

              <>

                <li className="nav-item">

                  <Link
                    className="nav-link"
                    to="/member/logout"
                    onClick={logout}
                  >
                    Logout
                  </Link>

                </li>


                {isAdmin ? (

                  <li className="nav-item">

                    <span className="nav-link">
                      관리자
                    </span>

                  </li>

                ) : (

                  <li className="nav-item">

                    <Link
                      className="nav-link"
                      to="/member/view"
                    >

                      {
                        login?.memberName
                        || login?.member_name
                        || login?.name
                        || "사용자"
                      }

                    </Link>

                  </li>

                )}

              </>

            )}

>>>>>>> 7321583662f0c547219cf9d9519144716d040892
          </ul>

        </div>

      </div>

    </nav>
  );
}


export default TopNavi;