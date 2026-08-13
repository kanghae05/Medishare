import { Navigate, Routes, Route } from "react-router-dom"
import TopNavi from "./components/common/TopNavi"
import Home from "./components/common/Home"
import NotFoundMenu from "./components/error/NotFoundMenu"
import BoardComp from "./components/board/BoardComp"
import MemberComp from "./components/member/MemberComp"
import ReportComp from "./components/report/ReportComp"
import PacsComp from "./components/pacs/PacsComp"
import CoopComp from "./components/coop/CoopComp"
import NoticeList from "./pages/Notice/NoticeList"
import NoticeDetail from "./pages/Notice/NoticeDetail"
import NoticeForm from "./pages/Notice/NoticeForm"
import SpecialCaseList from "./pages/SpecialCase/SpecialCaseList"
import SpecialCaseDetail from "./pages/SpecialCase/SpecialCaseDetail"
import SpecialCaseCreate from "./pages/SpecialCase/SpecialCaseCreate"
import DPartComp from "./components/dpart/DPartComp"

function App() {

  const token = localStorage.getItem("token")

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("login")) ?? null
    } catch {
      return null
    }
  })()
  const isAdmin = currentUser?.roles?.some((role) => role === "ADMIN" || role === "ROLE_ADMIN") ?? false

  return (
    <>
      {/* 맨 위에 메뉴 컴포넌트 : /src/components/common/TopNavi.jsx */}
      <TopNavi />

      <div className="container" style={{ paddingTop: "8rem" }}>
        {/* 라이팅 - 메뉴별 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board/*" element={<BoardComp />} />
          <Route path="/member/*" element={<MemberComp />} />
          <Route path="/report/*" element={<ReportComp />} />
          <Route path="/pacs/*" element={<PacsComp />} />
          <Route path="/coop/*" element={<CoopComp />} />
          {/* Notice module routes */}
          <Route path="/notices" element={token ? <NoticeList /> : <Navigate to="/" replace />} />
          <Route path="/notices/new" element={token ? <NoticeForm /> : <Navigate to="/" replace />} />
          <Route path="/notices/:noticeId" element={token ? <NoticeDetail isAdmin={isAdmin} /> : <Navigate to="/" replace />} />
          <Route path="/notices/:noticeId/edit" element={token ? <NoticeForm /> : <Navigate to="/" replace />} />
          {/* Special Case Library module routes */}
          <Route path="/special-cases" element={token ? <SpecialCaseList /> : <Navigate to="/" replace />} />
          <Route path="/special-cases/new" element={token ? <SpecialCaseCreate /> : <Navigate to="/" replace />} />
          <Route path="/special-cases/:caseId" element={token ? <SpecialCaseDetail currentUser={currentUser} /> : <Navigate to="/" replace />} />
          <Route path="/special-cases/:caseId/edit" element={token ? <SpecialCaseCreate /> : <Navigate to="/" replace />} />
          <Route path="/d/*" element={<DPartComp />} />
          <Route path="*" element={<NotFoundMenu />} />
        </Routes>
      </div>

      {/* 맨 아래 회사 소개 & 카피라이트 : /src/components/common/Footer.jsx */}
    </>
  )
}

export default App
