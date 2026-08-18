import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getNotices,
} from "../../pages/Notice/noticeApi";

import "./Home.css";


/* =========================================================
   BASE ICON
========================================================= */

function IconBase({
  children,
  size = 24,
  strokeWidth = 1.8,
  className = "",
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}


/* =========================================================
   COMMON ICON
========================================================= */

function SearchIcon({ size = 20 }) {
  return (
    <IconBase size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </IconBase>
  );
}


function ArrowIcon({ size = 17 }) {
  return (
    <IconBase size={size}>
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </IconBase>
  );
}


/* =========================================================
   BRAND MARK
========================================================= */

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="16" r="4.5" />
      <circle cx="22" cy="9" r="4.5" />
      <circle cx="22" cy="23" r="4.5" />

      <path d="M13 14l5-3" />
      <path d="M13 18l5 3" />
    </svg>
  );
}


/* =========================================================
   SERVICE ICON
========================================================= */

function StatisticsIcon() {
  return (
    <IconBase size={38}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3.5-4 3 2.5L19 7" />
    </IconBase>
  );
}


function PacsIcon() {
  return (
    <IconBase size={38}>
      <rect
        x="3.5"
        y="4"
        width="17"
        height="13"
        rx="2.5"
      />

      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M9 10.5h6" />
      <path d="M12 7.5v6" />
    </IconBase>
  );
}


function NoticeIcon() {
  return (
    <IconBase size={38}>
      <path d="M18 8a6 6 0 0 0-12 0c0 6.5-3 7-3 9h18c0-2-3-2.5-3-9" />
      <path d="M10 21h4" />
    </IconBase>
  );
}


function SpecialCaseIcon() {
  return (
    <IconBase size={38}>
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2.5"
      />

      <circle
        cx="11"
        cy="11"
        r="3"
      />

      <path d="m13.2 13.2 3.3 3.3" />
      <path d="M7 7h2" />
    </IconBase>
  );
}


function ReportIcon() {
  return (
    <IconBase size={38}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
      <path d="M14 3v5h5" />
      <path d="M8 12h5" />
      <path d="M8 16h3" />
      <path d="m14 18 5-5 2 2-5 5-3 1Z" />
    </IconBase>
  );
}


function ConsultationIcon() {
  return (
    <IconBase size={38}>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16.5" cy="9" r="2.5" />

      <path d="M3 19c.5-4.2 2.3-6 5-6 2.8 0 4.7 1.8 5.2 6" />
      <path d="M13.5 14.2c3.7-.7 6.4 1.2 7 4.8" />

      <path d="M15 5h5" />
      <path d="m18 2.5 2.5 2.5L18 7.5" />
    </IconBase>
  );
}


/* =========================================================
   NOTICE ICON
========================================================= */

function ShieldCheckIcon() {
  return (
    <IconBase size={42}>
      <path d="M12 3 20 6v5c0 5.2-3.2 8.4-8 10-4.8-1.6-8-4.8-8-10V6Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </IconBase>
  );
}


function DocumentIcon() {
  return (
    <IconBase size={42}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <path d="M14 3v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </IconBase>
  );
}


function BellRingIcon() {
  return (
    <IconBase size={42}>
      <path d="M18 8a6 6 0 0 0-12 0c0 6.5-3 7-3 9h18c0-2-3-2.5-3-9" />
      <path d="M10 21h4" />
      <path d="m20 4 2-2" />
      <path d="M4 4 2 2" />
    </IconBase>
  );
}


function getServiceIcon(title) {
  switch (title) {
    case "질환별 통계":
      return <StatisticsIcon />;

    case "PACS":
      return <PacsIcon />;

    case "공지사항":
      return <NoticeIcon />;

    case "특이케이스":
      return <SpecialCaseIcon />;

    case "판독소견":
      return <ReportIcon />;

    case "협진":
      return <ConsultationIcon />;

    default:
      return null;
  }
}


/* =========================================================
   HOME
========================================================= */

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    searchMessage,
    setSearchMessage,
  ] = useState("");

  const [
    notices,
    setNotices,
  ] = useState([]);

  const [
    noticeLoading,
    setNoticeLoading,
  ] = useState(true);


  const searchOpen =
    searchParams.get("search") === "open";


  const services = [
    {
      number: "01",
      title: "질환별 통계",
      english: "DISEASE STATISTICS",
      description:
        "질환별 판독 및 협진 데이터를 기간별로 확인합니다.",
      path: "/d/statistics",
      keywords: [
        "질환",
        "질환별",
        "통계",
        "데이터",
        "판독",
        "협진",
      ],
    },

    {
      number: "02",
      title: "PACS",
      english: "MEDICAL IMAGE",
      description:
        "DICOM 의료영상을 조회하고 OHIF Viewer로 확인합니다.",
      path: "/pacs/list",
      keywords: [
        "pacs",
        "dicom",
        "의료영상",
        "영상",
        "ohif",
        "viewer",
      ],
    },

    {
      number: "03",
      title: "공지사항",
      english: "NOTICE",
      description:
        "시스템의 주요 소식과 안내사항을 확인합니다.",
      path: "/notices",
      keywords: [
        "공지",
        "공지사항",
        "안내",
        "점검",
        "보안",
      ],
    },

    {
      number: "04",
      title: "특이케이스",
      english: "SPECIAL CASE",
      description:
        "주요 의료영상 판독 사례를 조회합니다.",
      path: "/special-cases",
      keywords: [
        "특이케이스",
        "케이스",
        "판독",
        "사례",
      ],
    },

    {
      number: "05",
      title: "판독소견",
      english: "REPORT",
      description:
        "PACS 검사별 판독소견을 작성하고 조회합니다.",
      path: "/report/list",
      keywords: [
        "판독",
        "판독소견",
        "소견",
        "작성",
      ],
    },

    {
      number: "06",
      title: "협진",
      english: "CONSULTATION",
      description:
        "의료진 간 협진 요청과 진행 내역을 확인합니다.",
      path: "/coop/received",
      keywords: [
        "협진",
        "협진요청",
        "받은협진",
        "보낸협진",
      ],
    },
  ];


  useEffect(() => {
    getNotices({
      keyword: "",
      page: 0,
      size: 3,
    })
      .then((data) => {
        setNotices(data?.content || []);
      })
      .catch(() => {
        setNotices([]);
      })
      .finally(() => {
        setNoticeLoading(false);
      });
  }, []);


  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "");


  const handleSearch = async () => {
    const keyword =
      searchText.trim();

    if (!keyword) {
      setSearchMessage(
        "검색어를 입력해주세요."
      );
      return;
    }

    const normalized =
      normalize(keyword);


    const service =
      services.find((item) =>
        [
          item.title,
          item.english,
          item.description,
          ...item.keywords,
        ].some((text) =>
          normalize(text).includes(
            normalized
          )
        )
      );


    if (service) {
      navigate(service.path);
      return;
    }


    try {
      const data =
        await getNotices({
          keyword,
          page: 0,
          size: 20,
        });


      const result =
        data?.content || [];


      if (result.length) {
        navigate(
          `/notices/${result[0].noticeId}`
        );
        return;
      }

    } catch {
      /* 검색 결과 없음으로 처리 */
    }


    setSearchMessage(
      `"${keyword}"에 해당하는 메뉴 또는 공지사항을 찾을 수 없습니다.`
    );
  };


  const closeSearch = () => {
    setSearchText("");
    setSearchMessage("");

    navigate("/", {
      replace: true,
    });
  };


  const getNoticeIcon = (
    notice,
    index
  ) => {
    const title =
      String(notice?.title || "");


    if (
      title.includes("점검") ||
      title.includes("보안")
    ) {
      return <ShieldCheckIcon />;
    }


    if (
      title.includes("안내") ||
      title.includes("서식")
    ) {
      return <DocumentIcon />;
    }


    if (
      title.includes("기능개선") ||
      title.includes("알림") ||
      title.includes("요청")
    ) {
      return <BellRingIcon />;
    }


    if (index === 0) {
      return <ShieldCheckIcon />;
    }

    if (index === 1) {
      return <DocumentIcon />;
    }

    return <BellRingIcon />;
  };


  return (
    <main className="medishare-home">


      {/* SEARCH */}

      {searchOpen && (
        <div className="home-search-overlay">

          <button
            type="button"
            className="home-search-close"
            onClick={closeSearch}
          >
            ×
          </button>


          <div className="home-search-box">

            <span className="home-eyebrow">
              MEDISHARE SEARCH
            </span>


            <h2>
              통합검색
            </h2>


            <p className="home-search-guide">
              주요 서비스와 공지사항을 검색할 수 있습니다.
            </p>


            <div className="home-search-input">

              <input
                autoFocus
                value={searchText}
                placeholder="검색어를 입력해주세요."
                onChange={(e) => {
                  setSearchText(
                    e.target.value
                  );

                  setSearchMessage("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />


              <button
                type="button"
                onClick={handleSearch}
              >
                <SearchIcon size={24} />
              </button>

            </div>


            {searchMessage && (
              <div className="home-search-message">
                <span className="home-search-message-icon">!</span>

                <div className="home-search-message-text">
                  <strong>
                    {searchMessage === "검색어를 입력해주세요."
                      ? "검색어를 입력해주세요"
                      : "검색 결과가 없습니다"}
                  </strong>

                  <p>
                    {searchMessage === "검색어를 입력해주세요."
                      ? "찾고 싶은 서비스 또는 공지사항의 키워드를 입력해주세요."
                      : searchMessage}
                  </p>

                  {searchMessage !== "검색어를 입력해주세요." && (
                    <small>
                      다른 검색어를 입력하거나 아래 빠른 검색을 이용해보세요.
                    </small>
                  )}
                </div>
              </div>
            )}


            <div className="home-quick-search">

              <strong>
                빠른 검색
              </strong>


              {services.map(
                (service) => (
                  <button
                    type="button"
                    key={service.title}
                    onClick={() =>
                      setSearchText(
                        service.title
                      )
                    }
                  >
                    #{service.title}
                  </button>
                )
              )}

            </div>

          </div>

        </div>
      )}



      {/* HERO */}

      <section className="home-hero">

        <div className="home-inner home-hero-layout">

          <div className="home-hero-content">

            <span className="home-eyebrow">
              MEDISHARE
            </span>


            <h1>
              의료영상과 판독, 협진을
              <br />
              한곳에서 더 편리하게
            </h1>


            <p>
              PACS 영상 조회부터 판독소견 작성과 협진까지 필요한 업무를 MediShare에서 한 번에 확인하세요.
            </p>


            <button
              type="button"
              className="home-primary-button"
              onClick={() =>
                navigate("/pacs/list")
              }
            >
              PACS 바로가기
              <ArrowIcon />
            </button>

          </div>


          <div className="home-hero-visual">

            <div className="hero-window">

              <div className="hero-window-top">
                <i />
                <i />
                <i />
              </div>


              <div className="hero-window-body">

                <span>
                  MEDICAL COLLABORATION
                </span>


                <strong>
                  MEDISHARE
                </strong>


                <div className="hero-function-grid">

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/pacs/list")
                    }
                  >
                    <PacsIcon />
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      navigate("/report/list")
                    }
                  >
                    <ReportIcon />
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      navigate("/coop/received")
                    }
                  >
                    <ConsultationIcon />
                  </button>

                </div>


                <div className="hero-lines">
                  <i />
                  <i />
                  <i />
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* SERVICE */}

      <section className="home-services">

        <div className="home-inner">

          <div className="home-section-header">

            <div>
              <span className="home-eyebrow">
                OUR SERVICE
              </span>

              <h2>
                주요 서비스
              </h2>
            </div>


            <p>
              의료진의 업무에 필요한 주요 기능을 바로 이용할 수 있습니다.
            </p>

          </div>


          <div className="home-service-grid">

            {services.map(
              (service) => (
                <button
                  type="button"
                  key={service.title}
                  className="home-service-card"
                  onClick={() =>
                    navigate(service.path)
                  }
                >

                  <div className="service-icon-box">
                    {getServiceIcon(
                      service.title
                    )}
                  </div>


                  <div className="home-service-info">

                    <div className="home-service-top">

                      <span>
                        {service.english}
                      </span>

                      <em>
                        {service.number}
                      </em>

                    </div>


                    <h3>
                      {service.title}
                    </h3>


                    <p>
                      {service.description}
                    </p>

                  </div>


                  <div className="home-service-link">
                    바로가기
                    <ArrowIcon />
                  </div>

                </button>
              )
            )}

          </div>

        </div>

      </section>



      {/* NOTICE */}

      <section className="home-notices">

        <div className="home-inner">

          <div className="home-section-header home-notice-header">

            <div>

              <span className="home-eyebrow">
                NOTICE
              </span>


              <h2>
                새로운 소식
              </h2>


              <p>
                MediShare의 주요 안내와 시스템 업데이트를 확인하세요.
              </p>

            </div>


            <button
              type="button"
              className="notice-more-button"
              onClick={() =>
                navigate("/notices")
              }
            >
              공지사항 전체보기
              <ArrowIcon />
            </button>

          </div>


          {noticeLoading ? (

            <div className="notice-empty">
              공지사항을 불러오는 중입니다.
            </div>

          ) : notices.length === 0 ? (

            <div className="notice-empty">
              등록된 공지사항이 없습니다.
            </div>

          ) : (

            <div className="home-notice-grid">

              {notices.map(
                (notice, index) => (
                  <button
                    type="button"
                    key={notice.noticeId}
                    className="home-notice-card"
                    onClick={() =>
                      navigate(
                        `/notices/${notice.noticeId}`
                      )
                    }
                  >

                    <div
                      className={`home-notice-thumb notice-${index}`}
                    >

                      <div className="notice-thumb-heading">

                        <span>
                          MEDISHARE
                        </span>


                        {notice.pinned && (
                          <strong className="notice-important-badge">
                            중요공지
                          </strong>
                        )}

                      </div>


                      <div className="notice-modern-icon">
                        {getNoticeIcon(
                          notice,
                          index
                        )}
                      </div>

                    </div>


                    <div className="home-notice-content">

                      <span
                        className={
                          notice.pinned
                            ? "notice-type notice-type-important"
                            : "notice-type"
                        }
                      >
                        {notice.pinned
                          ? "중요공지"
                          : "공지사항"}
                      </span>


                      <h3>
                        {notice.title}
                      </h3>


                      <div className="home-notice-bottom">

                        <time>
                          {notice.createdAt
                            ? new Date(
                                notice.createdAt
                              ).toLocaleDateString(
                                "ko-KR"
                              )
                            : ""}
                        </time>


                        <span>
                          자세히 보기
                          <ArrowIcon />
                        </span>

                      </div>

                    </div>

                  </button>
                )
              )}

            </div>
          )}

        </div>

      </section>



      {/* ABOUT */}

      <section className="home-about">

        <div className="home-inner home-about-layout">

          <div>

            <span className="home-eyebrow">
              ABOUT MEDISHARE
            </span>


            <h2>
              의료영상과 협진 업무를
              <br />
              하나의 환경에서 관리합니다.
            </h2>

          </div>


          <p>
            MediShare는 PACS 의료영상, 판독소견 및 협진 기능을 하나의 환경에서 제공하는 의료 협진 플랫폼입니다.
          </p>

        </div>

      </section>



      {/* FOOTER */}

      <footer className="home-footer">

        <div className="home-inner">

          <div className="home-footer-main">


            <div className="home-footer-brand-wrap">

              <div className="home-footer-brand">

                <span className="home-footer-brand-mark">
                  <BrandMark />
                </span>


                <strong>
                  MEDISHARE
                </strong>

              </div>


              <p>
                의료영상 · 판독 · 협진을 연결하는
                <br />
                통합 의료 협진 플랫폼
              </p>

            </div>


            <div className="home-footer-menu">

              {services.map(
                (service) => (
                  <button
                    type="button"
                    key={service.title}
                    onClick={() =>
                      navigate(service.path)
                    }
                  >
                    {service.title}
                  </button>
                )
              )}

            </div>

          </div>


          <div className="home-footer-divider" />


          <div className="home-footer-bottom">

            <span>
              MEDISHARE Medical Collaboration Platform
            </span>


            <span>
              © 2026 MEDISHARE. All rights reserved.
            </span>

          </div>

        </div>

      </footer>

    </main>
  );
}


export default Home;