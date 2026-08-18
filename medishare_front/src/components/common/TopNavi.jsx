import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  getStoredLogin,
  isAdminLogin,
  isDoctorLogin,
} from "../dpart/dpartUtils";

import "./TopNavi.css";


/* =========================================================
   ICONS
========================================================= */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}


function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}


function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}


function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}


/* =========================================================
   MEDISHARE BRAND MARK
========================================================= */

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="16"
        r="4.5"
      />

      <circle
        cx="22"
        cy="9"
        r="4.5"
      />

      <circle
        cx="22"
        cy="23"
        r="4.5"
      />

      <path d="M13 14l5-3" />
      <path d="M13 18l5 3" />
    </svg>
  );
}


/* =========================================================
   TOP NAVI
========================================================= */

function TopNavi() {
  const navigate =
    useNavigate();


  const [
    token,
    setToken,
  ] = useState(
    localStorage.getItem("token")
  );


  const [
    login,
    setLogin,
  ] = useState(
    getStoredLogin
  );


  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);


  const isLoggedIn =
    Boolean(token);


  const isAdmin =
    isAdminLogin(login);


  const isDoctor =
    isDoctorLogin(login);


  const isMedicalUser =
    isAdmin || isDoctor;


  /* =======================================================
     SITEMAP SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }


    return () => {
      document.body.style.overflow =
        "";
    };
  }, [menuOpen]);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = (
    event
  ) => {
    event.preventDefault();


    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "login"
    );


    setToken(null);

    setLogin(null);


    alert(
      "로그아웃되었습니다."
    );


    window.location.href =
      "/";
  };


  /* =======================================================
     SEARCH
  ======================================================= */

  const openSearch = () => {
    setMenuOpen(false);


    navigate(
      "/?search=open"
    );
  };


  /* =======================================================
     MENU MOVE
  ======================================================= */

  const moveMenu = (
    path
  ) => {
    setMenuOpen(false);


    navigate(path);
  };


  return (
    <>

      {/* ===================================================
          TOP NAVIGATION
      =================================================== */}

      <nav className="medishare-topnav">

        <div className="medishare-topnav-inner">


          {/* ===============================================
              LEFT
          =============================================== */}

          <div className="topnav-menu">


            {/* MEDISHARE BRAND */}

            <NavLink
              to="/"
              className="topnav-link topnav-brand"
            >

              <span className="brand-mark">
                <BrandMark />
              </span>


              <span className="brand-text">
                MEDISHARE
              </span>

            </NavLink>


            {/* 의사 협진 관리 */}

            {isLoggedIn &&
              isDoctor && (
                <NavLink
                  to="/d/dashboard"
                  className="topnav-link"
                >
                  협진 관리
                </NavLink>
              )}


            {/* 공통 통계 */}

            {isLoggedIn && (
              <NavLink
                to="/d/statistics"
                className="topnav-link"
              >
                질환별 통계
              </NavLink>
            )}


            {/* 공통 PACS */}

            {isMedicalUser && (
              <NavLink
                to="/pacs/list"
                className="topnav-link"
              >
                PACS
              </NavLink>
            )}


            {/* 관리자 메뉴 */}

            {isAdmin && (
              <>

                <NavLink
                  to="/admin/medical-staff"
                  className="topnav-link"
                >
                  의료진 관리
                </NavLink>


                <NavLink
                  to="/admin/access-logs"
                  className="topnav-link"
                >
                  접근 이력
                </NavLink>


                <NavLink
                  to="/admin/change-logs"
                  className="topnav-link"
                >
                  변경 이력
                </NavLink>

              </>
            )}


            {/* 관리자/의사 공통 */}

            {isLoggedIn && (
              <>

                <NavLink
                  to="/notices"
                  className="topnav-link"
                >
                  공지사항
                </NavLink>


                <NavLink
                  to="/special-cases"
                  className="topnav-link"
                >
                  특이케이스
                </NavLink>


                <NavLink
                  to="/report/list"
                  className="topnav-link"
                >
                  판독소견
                </NavLink>


                <NavLink
                  to="/coop/received"
                  className="topnav-link"
                >
                  협진
                </NavLink>

              </>
            )}

          </div>



          {/* ===============================================
              RIGHT
          =============================================== */}

          <div className="topnav-right">


            {/* SEARCH */}

            {isLoggedIn && (
              <button
                type="button"
                className="topnav-icon-button"
                onClick={
                  openSearch
                }
                aria-label="통합검색"
                title="통합검색"
              >
                <SearchIcon />
              </button>
            )}


            {/* SITEMAP */}

            {isLoggedIn && (
              <button
                type="button"
                className="topnav-icon-button"
                onClick={() =>
                  setMenuOpen(true)
                }
                aria-label="사이트맵 열기"
                title="사이트맵"
              >
                <MenuIcon />
              </button>
            )}


            {/* LOGIN BEFORE */}

            {!isLoggedIn ? (
              <>

                <Link
                  className="topnav-account"
                  to="/member/login"
                >
                  Login
                </Link>


                <Link
                  className="topnav-account"
                  to="/member/write"
                >
                  Join
                </Link>

              </>
            ) : (

              /* LOGIN AFTER */

              <>

                <Link
                  className="topnav-account"
                  to="/member/logout"
                  onClick={
                    logout
                  }
                >
                  Logout
                </Link>


                {isAdmin ? (

                  <span className="topnav-user">
                    관리자
                  </span>

                ) : (

                  <Link
                    className="topnav-user"
                    to="/member/view"
                  >

                    {login?.memberName ||
                      login?.member_name ||
                      login?.name ||
                      "사용자"}

                  </Link>

                )}

              </>
            )}

          </div>

        </div>

      </nav>



      {/* ===================================================
          SITEMAP
      =================================================== */}

      {menuOpen &&
        isLoggedIn && (

          <div className="sitemap-overlay">

            <div className="sitemap-inner">


              {/* ===========================================
                  HEADER
              =========================================== */}

              <div className="sitemap-header">

                <div>

                  <span>
                    MEDISHARE
                  </span>


                  <h2>
                    사이트맵
                  </h2>

                </div>


                <button
                  type="button"
                  className="sitemap-close"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  aria-label="사이트맵 닫기"
                >
                  <CloseIcon />
                </button>

              </div>


              <div className="sitemap-divider" />



              {/* ===========================================
                  01 COMMON SERVICE
              =========================================== */}

              <section className="sitemap-section">

                <div className="sitemap-section-title">

                  <span>
                    01
                  </span>


                  <div>

                    <h3>
                      주요 서비스
                    </h3>


                    <p>
                      의료진이 사용하는 주요 기능을 확인할 수 있습니다.
                    </p>

                  </div>

                </div>



                <div className="sitemap-menu-grid">


                  {/* 질환별 통계 */}

                  <button
                    type="button"
                    onClick={() =>
                      moveMenu(
                        "/d/statistics"
                      )
                    }
                  >

                    <span>
                      STATISTICS
                    </span>


                    <strong>
                      질환별 통계
                    </strong>


                    <p>
                      질환별 판독 및 협진 데이터를 조회합니다.
                    </p>


                    <ArrowIcon />

                  </button>



                  {/* PACS */}

                  {isMedicalUser && (

                    <button
                      type="button"
                      onClick={() =>
                        moveMenu(
                          "/pacs/list"
                        )
                      }
                    >

                      <span>
                        MEDICAL IMAGE
                      </span>


                      <strong>
                        PACS
                      </strong>


                      <p>
                        DICOM 의료영상과 Viewer를 확인합니다.
                      </p>


                      <ArrowIcon />

                    </button>

                  )}



                  {/* NOTICE */}

                  <button
                    type="button"
                    onClick={() =>
                      moveMenu(
                        "/notices"
                      )
                    }
                  >

                    <span>
                      NOTICE
                    </span>


                    <strong>
                      공지사항
                    </strong>


                    <p>
                      시스템의 주요 안내와 소식을 확인합니다.
                    </p>


                    <ArrowIcon />

                  </button>



                  {/* SPECIAL CASE */}

                  <button
                    type="button"
                    onClick={() =>
                      moveMenu(
                        "/special-cases"
                      )
                    }
                  >

                    <span>
                      SPECIAL CASE
                    </span>


                    <strong>
                      특이케이스
                    </strong>


                    <p>
                      주요 의료영상 판독 사례를 조회합니다.
                    </p>


                    <ArrowIcon />

                  </button>



                  {/* REPORT */}

                  <button
                    type="button"
                    onClick={() =>
                      moveMenu(
                        "/report/list"
                      )
                    }
                  >

                    <span>
                      REPORT
                    </span>


                    <strong>
                      판독소견
                    </strong>


                    <p>
                      검사별 판독소견을 작성하고 조회합니다.
                    </p>


                    <ArrowIcon />

                  </button>



                  {/* CONSULTATION */}

                  <button
                    type="button"
                    onClick={() =>
                      moveMenu(
                        "/coop/received"
                      )
                    }
                  >

                    <span>
                      CONSULTATION
                    </span>


                    <strong>
                      협진
                    </strong>


                    <p>
                      의료진 간 협진 요청과 진행 내역을 확인합니다.
                    </p>


                    <ArrowIcon />

                  </button>

                </div>

              </section>



              {/* ===========================================
                  ADMIN
              =========================================== */}

              {isAdmin && (
                <>

                  <div className="sitemap-divider sitemap-middle-divider" />


                  <section className="sitemap-section">

                    <div className="sitemap-section-title">

                      <span>
                        02
                      </span>


                      <div>

                        <h3>
                          관리자 기능
                        </h3>


                        <p>
                          의료진 정보와 시스템 이력을 관리할 수 있습니다.
                        </p>

                      </div>

                    </div>



                    <div className="sitemap-admin-grid">


                      <button
                        type="button"
                        onClick={() =>
                          moveMenu(
                            "/admin/medical-staff"
                          )
                        }
                      >

                        <span>
                          MANAGEMENT
                        </span>


                        <strong>
                          의료진 관리
                        </strong>


                        <ArrowIcon />

                      </button>



                      <button
                        type="button"
                        onClick={() =>
                          moveMenu(
                            "/admin/access-logs"
                          )
                        }
                      >

                        <span>
                          ACCESS LOG
                        </span>


                        <strong>
                          접근 이력
                        </strong>


                        <ArrowIcon />

                      </button>



                      <button
                        type="button"
                        onClick={() =>
                          moveMenu(
                            "/admin/change-logs"
                          )
                        }
                      >

                        <span>
                          CHANGE LOG
                        </span>


                        <strong>
                          변경 이력
                        </strong>


                        <ArrowIcon />

                      </button>

                    </div>

                  </section>

                </>
              )}



              {/* ===========================================
                  DOCTOR
              =========================================== */}

              {isDoctor && (
                <>

                  <div className="sitemap-divider sitemap-middle-divider" />


                  <section className="sitemap-section">

                    <div className="sitemap-section-title">

                      <span>
                        02
                      </span>


                      <div>

                        <h3>
                          의료진 기능
                        </h3>


                        <p>
                          의료진의 협진 업무를 확인할 수 있습니다.
                        </p>

                      </div>

                    </div>



                    <div className="sitemap-admin-grid">

                      <button
                        type="button"
                        onClick={() =>
                          moveMenu(
                            "/d/dashboard"
                          )
                        }
                      >

                        <span>
                          COOPERATION
                        </span>


                        <strong>
                          협진 관리
                        </strong>


                        <ArrowIcon />

                      </button>

                    </div>

                  </section>

                </>
              )}



              {/* ===========================================
                  FOOTER
              =========================================== */}

              <div className="sitemap-footer">

                <div className="sitemap-footer-brand">

                  <span className="sitemap-footer-mark">
                    <BrandMark />
                  </span>


                  <strong>
                    MEDISHARE
                  </strong>

                </div>


                <p>
                  Medical Collaboration Platform
                </p>

              </div>

            </div>

          </div>

        )}

    </>
  );
}


export default TopNavi;
