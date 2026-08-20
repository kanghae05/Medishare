import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";
import "./Coop.css";

const AUTO_DISMISS_MS = 5000;

// 개인 알림 채널에 연결해서, 새 협진요청/채팅 메시지가 오면 카톡처럼 토스트를 띄운다.
// CoopComp.jsx 최상단에 딱 하나만 마운트해서, /coop/* 안에서 어느 페이지로 이동하든 계속 연결이 유지되게 한다.
function CoopNotificationCenter() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  useEffect(() => {
    const timers = timersRef.current; // cleanup 시점엔 ref.current가 바뀌어있을 수 있어 변수로 고정해둔다

    const token = localStorage.getItem("token");
    const wsBase = (api.defaults.baseURL || "").replace(/^http/, "ws");
    const ws = new WebSocket(`${wsBase}/ws/coop-notify?token=${encodeURIComponent(token || "")}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, ...data }]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timers.delete(id);
      }, AUTO_DISMISS_MS);
      timers.set(id, timer);
    };

    return () => {
      ws.close();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const dismiss = (id) => {
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClick = (toast) => {
    dismiss(toast.id);
    if (toast.linkUrl) navigate(toast.linkUrl);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="coop-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className="coop-toast" onClick={() => handleClick(t)}>
          <div className="coop-toast-icon">{t.type === "chat_message" ? "💬" : "📋"}</div>
          <div className="coop-toast-body">
            <div className="coop-toast-title">{t.title}</div>
            <div className="coop-toast-message">{t.message}</div>
          </div>
          <button
            type="button"
            className="coop-toast-close"
            onClick={(e) => {
              e.stopPropagation();
              dismiss(t.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default CoopNotificationCenter;