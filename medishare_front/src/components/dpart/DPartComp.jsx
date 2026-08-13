import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import DashboardPage from "./DashboardPage";
import SchedulePage from "./SchedulePage";
import ConsultationStatusPage from "./ConsultationStatusPage";
import DiseaseStatisticsPage from "./DiseaseStatisticsPage";
import { canAccessDPart, getCurrentUser } from "./dpartUtils";
import "./DPart.css";

function DPartComp() {
  const user = getCurrentUser();

  if (!canAccessDPart()) {
    return <Navigate to="/member/login" replace />;
  }

  const scheduleLabel = user.isAdmin ? "의료진 일정" : "의사 일정";
  const consultationLabel = user.isAdmin ? "전체 협진 현황" : "협진 현황";

  return (
    <div className="dpart-shell">
      <div className="dpart-layout">
        <aside className="dpart-sidebar">
          <div className="dpart-brand">
            <span className="dpart-brand-mark">D</span>
            <div>
              <strong>{user.isAdmin ? "관리자" : "의료진"}</strong>
              <span>{user.department}</span>
            </div>
          </div>
          <nav className="dpart-menu">
            <NavLink to="/d/dashboard">Dashboard</NavLink>
            <NavLink to="/d/schedule">{scheduleLabel}</NavLink>
            <NavLink to="/d/consultations">{consultationLabel}</NavLink>
            <NavLink to="/d/statistics">질환별 통계</NavLink>
          </nav>
        </aside>

        <main className="dpart-main">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="consultations" element={<ConsultationStatusPage />} />
            <Route path="statistics" element={<DiseaseStatisticsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DPartComp;
