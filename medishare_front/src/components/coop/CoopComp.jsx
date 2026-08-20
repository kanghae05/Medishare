import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import CoopSidebar from "./CoopSidebar";
import CoopRequestList from "./CoopRequestList";
import CoopRequestWriteForm from "./CoopRequestWriteForm";
import CoopRequestView from "./CoopRequestView";
import CoopAdminList from "./CoopAdminList";
import CoopChatList from "./CoopChatList";
import CoopChatRoom from "./CoopChatRoom";
import CoopNotificationCenter from "./CoopNotificationCenter";
import { isAdmin } from "./coopAuth";
import "./Coop.css";

// 사이드바(탭 스트립)가 있는 일반 화면들의 공통 레이아웃 - 제목도 여기서만 그린다.
// 관리자는 이 레이아웃 자체를 아예 타지 않는다 (관리자는 협진을 주고받는 당사자가 될 수 없어서
// 받은/보낸/전체 같은 "개인용" 탭이 의미가 없다 - 무조건 전체 조회 화면 하나만 본다).
function CoopSidebarLayout() {
  return (
    <div className="mb-5">
      <div className="coop-module-header">
        <span className="coop-module-eyebrow">MEDISHARE · CONSULTATION</span>
        <h2 className="coop-page-title">협진함</h2>
      </div>
      <div className="coop-layout">
        <CoopSidebar />
        <div className="coop-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// App.jsx에는 <Route path="/coop/*" element={<CoopComp />} /> 한 줄만 등록한다.
function CoopComp() {
  const admin = isAdmin();

  if (admin) {
    return (
      <Routes>
        <Route path="admin" element={<CoopAdminList />} />
        {/* 관리자 목록에서 항목 클릭하면 상세는 볼 수 있어야 하니 view만 예외적으로 허용 (읽기 전용) */}
        <Route path="view" element={<CoopRequestView />} />
        {/* 그 외(받은/보낸/전체/등록 등 개인용 화면, 또는 빈 /coop)는 전부 관리자 전체 조회로 보낸다 */}
        <Route path="*" element={<Navigate to="/coop/admin" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <CoopNotificationCenter />
      <Routes>
        <Route element={<CoopSidebarLayout />}>
          <Route path="received" element={<CoopRequestList mode="received" />} />
          <Route path="sent" element={<CoopRequestList mode="sent" />} />
          <Route path="all" element={<CoopRequestList mode="all" />} />
          <Route path="write" element={<CoopRequestWriteForm />} />
          <Route path="view" element={<CoopRequestView />} />
          <Route path="chats" element={<CoopChatList />} />
          <Route path="chat" element={<CoopChatRoom />} />
        </Route>
        <Route index element={<Navigate to="/coop/received" replace />} />
        {/* 일반 계정은 관리자 화면에 못 들어간다 (백엔드도 /coop/admin/** 를 ROLE_ADMIN으로 막아뒀지만,
            프론트에서도 애초에 라우트 자체를 안 열어줘서 이중으로 막는다) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default CoopComp;