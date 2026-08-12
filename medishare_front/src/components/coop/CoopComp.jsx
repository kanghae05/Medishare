import { Routes, Route } from "react-router-dom"; 
import NotFoundPage from "../error/NotFoundPage";
import CoopRequestWriteForm from "./CoopRequestWriteForm";
import CoopRequestList from "./CoopRequestList";


function MemberComp(){
  return (
    <div className="mt-5">
      <h2>협진함</h2>
      <Routes>
      <Route path="received" element={<CoopRequestList mode="received" />} />
      <Route path="write" element={<CoopRequestWriteForm mode="received" />} />
      <Route path="sent" element={<CoopRequestList mode="sent" />} />
      <Route path="all" element={<CoopRequestList mode="all" />} />
              <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default MemberComp;