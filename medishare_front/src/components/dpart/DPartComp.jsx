import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import DashboardPage from "./DashboardPage";
import SchedulePage from "./SchedulePage";
import ConsultationStatusPage from "./ConsultationStatusPage";
import {
  canAccessConsultationManagement,
  canAccessDPart,
  getCurrentUser,
} from "./dpartUtils";
import "./DPart.css";

function DoctorOnlyRoute({ children }) {
  if (canAccessConsultationManagement()) return children;
  return <Navigate to="/member/login" replace />;
}

function DPartComp() {
  const user = getCurrentUser();

  if (!canAccessDPart()) {
    return <Navigate to="/member/login" replace />;
  }

  return (
    <section className="dpart-shell">
      <div className="dpart-hero">
        <div>
          <span className="dpart-eyebrow">MEDISHARE · DOCTOR</span>
          <h1>협진 관리</h1>
          <p>
            의료진 일정과 협진 진행 현황을 한곳에서 확인하고 관리합니다.
          </p>
        </div>
        <div className="dpart-hero-card">
          <span>{user.isAdmin ? "ADMIN" : "DOCTOR"}</span>
          <strong>{user.name}</strong>
          <small>{user.department}</small>
        </div>
      </div>

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
            <NavLink to="/d/dashboard">협진 관리 메인</NavLink>
            <NavLink to="/d/schedule">의사 일정</NavLink>
            <NavLink to="/d/consultations">협진 현황</NavLink>
          </nav>
        </aside>

        <main className="dpart-main">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <DoctorOnlyRoute>
                  <DashboardPage />
                </DoctorOnlyRoute>
              }
            />
            <Route
              path="schedule"
              element={
                <DoctorOnlyRoute>
                  <SchedulePage />
                </DoctorOnlyRoute>
              }
            />
            <Route
              path="consultations"
              element={
                <DoctorOnlyRoute>
                  <ConsultationStatusPage />
                </DoctorOnlyRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </section>
  );
}

export default DPartComp;
