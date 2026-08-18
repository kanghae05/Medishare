import { Navigate, Routes, Route } from "react-router-dom";
import TopNavi from "./components/common/TopNavi";
import Home from "./components/common/Home";
import NotFoundMenu from "./components/error/NotFoundMenu";
import MemberComp from "./components/member/MemberComp";
import ReportComp from "./components/report/ReportComp";
import PacsComp from "./components/pacs/PacsComp";
import CoopComp from "./components/coop/CoopComp";
import NoticeList from "./pages/Notice/NoticeList";
import NoticeDetail from "./pages/Notice/NoticeDetail";
import NoticeForm from "./pages/Notice/NoticeForm";
import SpecialCaseList from "./pages/SpecialCase/SpecialCaseList";
import SpecialCaseDetail from "./pages/SpecialCase/SpecialCaseDetail";
import SpecialCaseCreate from "./pages/SpecialCase/SpecialCaseCreate";
import DPartComp from "./components/dpart/DPartComp";
import MedicalStaffManagement from "./pages/Admin/MedicalStaffManagement";
import MedicalStaffDetail from "./pages/Admin/MedicalStaffDetail";
import AccessLogManagement from "./pages/Admin/AccessLogManagement";
import AccessLogDetail from "./pages/Admin/AccessLogDetail";
import ChangeHistoryManagement from "./pages/Admin/ChangeHistoryManagement";
import ChangeHistoryDetail from "./pages/Admin/ChangeHistoryDetail";

function App() {
  const token = localStorage.getItem("token");

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("login")) ?? null;
    } catch {
      return null;
    }
  })();

  const isAdmin =
    currentUser?.roles?.some(
      (role) => role === "ADMIN" || role === "ROLE_ADMIN"
    ) ?? false;

  return (
    <>
      {/* 맨 위에 메뉴 컴포넌트 : /src/components/common/TopNavi.jsx */}
      <TopNavi />

      <div
        className="container"
        style={{ paddingTop: "8rem" }}
      >
        {/* 라이팅 - 메뉴별 */}
        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Member */}
          <Route
            path="/member/*"
            element={<MemberComp />}
          />

          {/* Report */}
          <Route
            path="/report/*"
            element={<ReportComp />}
          />

          {/* PACS - 비로그인 상태에서는 로그인 화면으로 이동 */}
          <Route
            path="/pacs/*"
            element={
              token ? (
                <PacsComp />
              ) : (
                <Navigate
                  to="/member/login"
                  replace
                />
              )
            }
          />

          {/* Coop */}
          <Route
            path="/coop/*"
            element={<CoopComp />}
          />

          {/* Notice module routes */}
          <Route
            path="/notices"
            element={
              token ? (
                <NoticeList isAdmin={isAdmin} />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )
            }
          />

          <Route
            path="/notices/new"
            element={
              token && isAdmin ? (
                <NoticeForm />
              ) : (
                <Navigate
                  to="/notices"
                  replace
                />
              )
            }
          />

          <Route
            path="/notices/:noticeId"
            element={
              token ? (
                <NoticeDetail isAdmin={isAdmin} />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )
            }
          />

          <Route
            path="/notices/:noticeId/edit"
            element={
              token && isAdmin ? (
                <NoticeForm />
              ) : (
                <Navigate
                  to="/notices"
                  replace
                />
              )
            }
          />

          {/* Special Case Library module routes */}
          <Route
            path="/special-cases"
            element={
              token ? (
                <SpecialCaseList />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )
            }
          />

          <Route
            path="/special-cases/new"
            element={
              token ? (
                <SpecialCaseCreate />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )
            }
          />

          <Route
            path="/special-cases/:caseId"
            element={
              token ? (
                <SpecialCaseDetail
                  currentUser={currentUser}
                />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )
            }
          />

          <Route
            path="/special-cases/:caseId/edit"
            element={
              token ? (
                <SpecialCaseCreate />
              ) : (
                <Navigate
                  to="/"
                  replace
                />
              )
            }
          />

          {/* Disease / Doctor */}
          <Route
            path="/d/*"
            element={<DPartComp />}
          />

          {/* Admin */}
          <Route
            path="/admin/medical-staff"
            element={
              <MedicalStaffManagement
                isAdmin={isAdmin}
              />
            }
          />

          <Route
            path="/admin/medical-staff/:memberNo"
            element={
              <MedicalStaffDetail
                isAdmin={isAdmin}
              />
            }
          />

          <Route
            path="/admin/access-logs"
            element={
              <AccessLogManagement
                isAdmin={isAdmin}
              />
            }
          />

          <Route
            path="/admin/access-logs/:logNo"
            element={
              <AccessLogDetail
                isAdmin={isAdmin}
              />
            }
          />

          <Route
            path="/admin/change-logs"
            element={
              <ChangeHistoryManagement
                isAdmin={isAdmin}
              />
            }
          />

          <Route
            path="/admin/change-logs/:historyNo"
            element={
              <ChangeHistoryDetail
                isAdmin={isAdmin}
              />
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFoundMenu />}
          />

        </Routes>
      </div>

      {/* 맨 아래 회사 소개 & 카피라이트 :
          /src/components/common/Footer.jsx */}
    </>
  );
}

export default App;