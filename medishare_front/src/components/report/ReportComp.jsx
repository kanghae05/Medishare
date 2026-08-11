import { Route, Routes } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import ReportList from "./ReportList";
import ReportWrite from "./ReportWrite";
import ReportView from "./ReportView";
import ReportUpdate from "./ReportUpdate";

function ReportComp() {
  return (
    <div className="mt-5">
      <Routes>
        <Route path="list" element={<ReportList />} />
        <Route path="write" element={<ReportWrite />} />
        <Route path="view/:no" element={<ReportView />} />
        <Route path="update/:no" element={<ReportUpdate />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default ReportComp;
