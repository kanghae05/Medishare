import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../common/api";
import "./Coop.css";

function CoopSidebar() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api
      .get("/coop/unreadCount.do")
      .then((res) => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => {});
  }, []);

  const linkClass = ({ isActive }) => "coop-sidebar-link" + (isActive ? " active" : "");

  return (
    <aside className="coop-sidebar">
      <NavLink to="/coop/write" className="coop-sidebar-new">
        + 새 협진 요청
      </NavLink>
      <nav className="coop-sidebar-nav">
        <NavLink to="/coop/received" className={linkClass}>
          받은 협진함
          {unreadCount > 0 && <span className="count-badge">{unreadCount}</span>}
        </NavLink>
        <NavLink to="/coop/sent" className={linkClass}>
          보낸 협진함
        </NavLink>
        <NavLink to="/coop/all" className={linkClass}>
          전체 협진 내역
        </NavLink>
      </nav>
    </aside>
  );
}

export default CoopSidebar;