import { Routes, Route } from "react-router-dom"; 
import NotFoundPage from "../error/NotFoundPage";
import CoopRequestWriteForm from "./CoopRequestWriteForm";
import CoopRequestList from "./CoopRequestList";
import CoopSidebar from "./CoopSidebar";
import "./Coop.css";
import CoopRequestView from "./CoopRequestView";


function CoopComp(){
  return (
    <div className="mt-5">
      <h2>협진함</h2>
      <div className="coop-layout mt-5">
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
  )
}

export default CoopComp;