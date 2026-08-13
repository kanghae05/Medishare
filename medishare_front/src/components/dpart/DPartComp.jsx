import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import DashboardPage from "./DashboardPage";
import SchedulePage from "./SchedulePage";
import ConsultationStatusPage from "./ConsultationStatusPage";
import DiseaseStatisticsPage from "./DiseaseStatisticsPage";
import {
  canAccessConsultationManagement,
  canAccessDPart,
  canAccessDiseaseStatistics,
  getCurrentUser,
} from "./dpartUtils";
import "./DPart.css";

function DoctorOnlyRoute({ children }) {
  if (canAccessConsultationManagement()) return children;
  if (canAccessDiseaseStatistics()) return <Navigate to="/d/statistics" replace />;
  return <Navigate to="/member/login" replace />;
}

function AuthenticatedRoute({ children }) {
  if (canAccessDiseaseStatistics()) return children;
  return <Navigate to="/member/login" replace />;
}

function DPartComp() {
  const user = getCurrentUser();
  const location = useLocation();

  if (!canAccessDPart()) {
    return <Navigate to="/member/login" replace />;
  }

  const isStatisticsArea = location.pathname.startsWith("/d/statistics") || !user.isDoctor;

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
            {isStatisticsArea ? (
              <NavLink to="/d/statistics">질환별 통계</NavLink>
            ) : (
              <>
                <NavLink to="/d/dashboard">협진 관리</NavLink>
                <NavLink to="/d/schedule">의사 일정</NavLink>
                <NavLink to="/d/consultations">협진 현황</NavLink>
              </>
            )}
          </nav>
        </aside>

        <main className="dpart-main">
          <Routes>
            <Route index element={<Navigate to={user.isDoctor ? "dashboard" : "statistics"} replace />} />
            <Route path="dashboard" element={<DoctorOnlyRoute><DashboardPage /></DoctorOnlyRoute>} />
            <Route path="schedule" element={<DoctorOnlyRoute><SchedulePage /></DoctorOnlyRoute>} />
            <Route path="consultations" element={<DoctorOnlyRoute><ConsultationStatusPage /></DoctorOnlyRoute>} />
            <Route path="statistics" element={<AuthenticatedRoute><DiseaseStatisticsPage /></AuthenticatedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default DPartComp;
