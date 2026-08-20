import { useEffect, useState } from "react";
import api from "../common/api";

const POLL_MS = 20000;

// 탑네비 "협진" 메뉴 옆에 붙이는 배지. 협진요청 안읽음 + 채팅 안읽음을 합쳐서 보여준다.
// 탑네비는 /coop 바깥 화면에서도 항상 떠 있어서, 라우트 이동 기반이 아니라 주기적으로 재조회한다.
function CoopNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchCount = () => {
      Promise.all([
        api.get("/coop/unreadCount.do").catch(() => ({ data: { unreadCount: 0 } })),
        api.get("/coop/chats/unreadCount.do").catch(() => ({ data: { unreadCount: 0 } })),
      ]).then(([reqRes, chatRes]) => {
        if (ignore) return;
        const total = (reqRes.data.unreadCount || 0) + (chatRes.data.unreadCount || 0);
        setCount(total);
      });
    };

    fetchCount();
    const timer = setInterval(fetchCount, POLL_MS);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, []);

  if (count === 0) return null;

  return <span className="coop-nav-badge">{count > 99 ? "99+" : count}</span>;
}

export default CoopNavBadge;