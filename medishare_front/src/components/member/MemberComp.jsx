import { Routes, Route } from "react-router-dom"; 
import NotFoundPage from "../error/NotFoundPage";
import MemberLogin from "./MemberLogin";
import MemberWrite from "./MemberWrite";

function MemberComp(){
  return (
    <div className="mt-5">
      <h2>회원 관리</h2>
      <Routes>
        <Route path="login" element={<MemberLogin /> } />
        <Route path="write" element={<MemberWrite /> } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default MemberComp;