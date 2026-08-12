import { Routes, Route } from "react-router-dom"; 
import NotFoundPage from "../error/NotFoundPage";
import ReceivedCoopList from "./ReceivedCoopList";

function MemberComp(){
  return (
    <div className="mt-5">
      <h2>협진함</h2>
      <Routes>
        <Route path="receivedCoopList" element={<ReceivedCoopList /> } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default MemberComp;