import { Routes, Route } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import CoopSidebar from "./CoopSidebar";
import CoopRequestList from "./CoopRequestList";
import CoopRequestWriteForm from "./CoopRequestWriteForm";
import CoopRequestView from "./CoopRequestView";
import "./Coop.css";

// App.jsx에는 <Route path="/coop/*" element={<CoopComp />} /> 한 줄만 등록한다.
function CoopComp() {
  return (
    <div className="mt-5">
      <div className="coop-module-header">
        <span className="coop-module-eyebrow">MEDISHARE · CONSULTATION</span>
        <h2 className="coop-page-title">협진함</h2>
      </div>
      <div className="coop-layout">
        <CoopSidebar />
        <div className="coop-content">
          <Routes>
            <Route path="received" element={<CoopRequestList mode="received" />} />
            <Route path="sent" element={<CoopRequestList mode="sent" />} />
            <Route path="all" element={<CoopRequestList mode="all" />} />
            <Route path="write" element={<CoopRequestWriteForm />} />
            <Route path="view" element={<CoopRequestView />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default CoopComp;