import { Routes, Route } from "react-router-dom"
import TopNavi from "./components/common/TopNavi"
import Home from "./components/common/Home"
import NotFoundMenu from "./components/error/NotFoundMenu"
import BoardComp from "./components/board/BoardComp"
import MemberComp from "./components/member/MemberComp"
import PacsComp from "./components/pacs/PacsComp"

function App() {

  return (
    <>
      {/* 맨 위에 메뉴 컴포넌트 : /src/components/common/TopNavi.jsx */}
      <TopNavi />

      <div className="container pt-5">
      {/* 라이팅 - 메뉴별 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board/*" element={<BoardComp />} />
          <Route path="/member/*" element={<MemberComp />} />

          {/* PACS */}
          <Route path="/pacs/*" element={<PacsComp />} />

          <Route path="*" element={<NotFoundMenu />} />
        </Routes>
      </div>

      {/* 맨 아래 회사 소개 & 카피라이트 : /src/components/common/Footer.jsx */}
    </>
  )
}

export default App