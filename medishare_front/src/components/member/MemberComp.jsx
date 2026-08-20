import { Routes, Route } from "react-router-dom";
import NotFoundPage from "../error/NotFoundPage";
import MemberLogin from "./MemberLogin";
import MemberWrite from "./MemberWrite";
import MemberView from "./MemberView";

function MemberComp() {
  return (
    <Routes>
      <Route path="login" element={<MemberLogin />} />
      <Route path="write" element={<MemberWrite />} />
      <Route path="view" element={<MemberView />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default MemberComp;
