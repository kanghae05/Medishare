import { Routes, Route } from "react-router-dom"
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

function App() {

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
          <Route path="/notices" element={<NoticeList />} />
          <Route path="/notices/new" element={<NoticeForm />} />
          <Route path="/notices/:noticeId" element={<NoticeDetail isAdmin={isAdmin} />} />
          <Route path="/notices/:noticeId/edit" element={<NoticeForm />} />
          {/* Special Case Library module routes */}
          <Route path="/special-cases" element={<SpecialCaseList />} />
          <Route path="/special-cases/new" element={<SpecialCaseCreate />} />
          <Route path="/special-cases/:caseId" element={<SpecialCaseDetail currentUser={currentUser} />} />
          <Route path="/special-cases/:caseId/edit" element={<SpecialCaseCreate />} />
          <Route path="*" element={<NotFoundMenu />} />
        </Routes>
      </div>

      {/* 맨 아래 회사 소개 & 카피라이트 : /src/components/common/Footer.jsx */}
    </>
  )
}

export default App
