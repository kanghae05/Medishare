import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import DashboardPage from "./DashboardPage";
import SchedulePage from "./SchedulePage";
import ConsultationStatusPage from "./ConsultationStatusPage";
import DiseaseStatisticsPage from "./DiseaseStatisticsPage";
import { currentUser } from "./dpartUtils";
import "./DPart.css";

function DPartComp() {
  return (
    <div className="dpart-shell">
      <div className="dpart-layout">
        <aside className="dpart-sidebar">
          <div className="dpart-brand">
            <span className="dpart-brand-mark">D</span>
            <div>
              <strong>{currentUser.role === "ADMIN" ? "관리자" : "의료진"}</strong>
              <span>{currentUser.department}</span>
            </div>
          </div>
          <nav className="dpart-menu">
            <NavLink to="/d/dashboard">Dashboard</NavLink>
            <NavLink to="/d/schedule">의사 일정</NavLink>
            <NavLink to="/d/consultations">협진 현황</NavLink>
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
