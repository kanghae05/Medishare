import { Routes, Route, Navigate } from "react-router-dom";
import PacsList from "./PacsList";
import NotFoundPage from "../error/NotFoundPage";

function PacsComp() {

  return (
    <div className="mt-5">

      <h2>PACS System</h2>

      <Routes>

        {/* /pacs 로 들어오면 /pacs/list 로 이동 */}
        <Route
          index
          element={<Navigate to="list" replace />}
        />

        {/* PACS Study 목록 */}
        <Route
          path="list"
          element={<PacsList />}
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