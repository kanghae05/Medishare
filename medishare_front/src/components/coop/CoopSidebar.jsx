import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../common/api";

function CoopSidebar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    api
      .get("/coop/unreadCount.do")
      .then((res) => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => {});
    api
      .get("/coop/chats/unreadCount.do")
      .then((res) => setChatUnreadCount(res.data.unreadCount || 0))
      .catch(() => {});
  }, []);

  const linkClass = ({ isActive }) => "coop-tab" + (isActive ? " active" : "");

  return (
    <aside className="coop-tabstrip">
      <NavLink to="/coop/write" className="coop-sidebar-new">
        + 새 협진 요청
      </NavLink>
      <nav className="coop-tabstrip-nav">
        <NavLink to="/coop/received" className={linkClass}>
          <span className="coop-tab-label">받은 협진함</span>
          {unreadCount > 0 && <span className="count-badge">{unreadCount}</span>}
        </NavLink>
        <NavLink to="/coop/sent" className={linkClass}>
          <span className="coop-tab-label">보낸 협진함</span>
        </NavLink>
        <NavLink to="/coop/all" className={linkClass}>
          <span className="coop-tab-label">전체 협진 내역</span>
        </NavLink>
        <NavLink to="/coop/chats" className={linkClass}>
          <span className="coop-tab-label">대화함</span>
          {chatUnreadCount > 0 && <span className="count-badge">{chatUnreadCount}</span>}
        </NavLink>
      </nav>
    </aside>
  );
}

export default CoopSidebar;