import { Routes, Route, Navigate } from "react-router-dom";
import PacsList from "./PacsList";
import PacsDetail from "./PacsDetail";
import NotFoundPage from "../error/NotFoundPage";

function PacsComp() {

  return (
    <div className="mt-5">

      <h2>PACS System</h2>

      <Routes>

        {/* /pacs → /pacs/list */}
        <Route
          index
          element={<Navigate to="list" replace />}
        />

        {/* PACS Study 목록 */}
        <Route
          path="list"
          element={<PacsList />}
        />

        {/* PACS Study 상세 */}
        <Route
          path="view/:studyId"
          element={<PacsDetail />}
        />

        {/* 잘못된 주소 */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>

    </div>
  );
}

export default PacsComp;