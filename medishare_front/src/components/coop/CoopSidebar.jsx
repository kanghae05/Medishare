import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import api from "../common/api";

function CoopSidebar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // location.key가 페이지 이동마다 바뀌므로, 사이드바 자체는 안 사라져도(레이아웃 공용)
  // 화면 이동할 때마다 배지 개수를 새로 불러온다 - 새로고침 없이도 방금 읽은 게 바로 반영되게.
  useEffect(() => {
    api
      .get("/coop/unreadCount.do")
      .then((res) => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => {});
    api
      .get("/coop/chats/unreadCount.do")
      .then((res) => setChatUnreadCount(res.data.unreadCount || 0))
      .catch(() => {});
  }, [location.key]);

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
          <span className="coop-tab-label">채팅</span>
          {chatUnreadCount > 0 && <span className="count-badge">{chatUnreadCount}</span>}
        </NavLink>
      </nav>
    </aside>
  );
}

export default CoopSidebar;