import { useEffect, useRef, useState } from "react";
import api from "../common/api";
import "./Coop.css";

// 협진요청 건별 실시간 채팅. WebSocket 연결 전에 REST로 이력을 먼저 불러온다.
// large=true면 대화방 전용 화면처럼 메시지 영역을 크게 보여준다 (상세화면에 곁들일 땐 기본 크기).
function CoopChatPanel({ coopRequestId, large = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  // 1) 이력 불러오기
  useEffect(() => {
    if (!coopRequestId) return;
    let ignore = false;
    api
      .get(`/coop/${coopRequestId}/messages.do`)
      .then((res) => {
        if (!ignore) setMessages(res.data || []);
      })
      .catch(() => {
        if (!ignore) setLoadError("채팅 이력을 불러오지 못했습니다. (권한이 없거나 서버 연결 문제)");
      });
    return () => {
      ignore = true;
    };
  }, [coopRequestId]);

  // 2) WebSocket 연결
  useEffect(() => {
    if (!coopRequestId) return;

    const token = localStorage.getItem("token");
    const wsBase = (api.defaults.baseURL || "").replace(/^http/, "ws");
    const ws = new WebSocket(`${wsBase}/ws/coop/${coopRequestId}?token=${encodeURIComponent(token || "")}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "read") {
        // 상대방이 방금 이 방을 열어서, 내가 보낸 메시지들을 다 읽었다는 실시간 알림.
        setMessages((prev) => prev.map((m) => (m.mine ? { ...m, read: true } : m)));
        return;
      }
      setMessages((prev) => [...prev, msg]);
    };

    return () => {
      ws.close();
    };
  }, [coopRequestId]);

  // 3) 새 메시지 오면 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: text }));
    setInput("");
  };

  return (
    <div className="coop-chat-panel">
      <div className="coop-chat-header">
        <span className="coop-detail-section-title" style={{ margin: 0, border: "none", padding: 0 }}>
          채팅
        </span>
        <span className={"coop-chat-status" + (connected ? " online" : "")}>
          {connected ? "연결됨" : "연결 안 됨"}
        </span>
      </div>

      {loadError && <div className="coop-empty">{loadError}</div>}

      <div className={"coop-chat-messages" + (large ? " coop-chat-messages-large" : "")}>
        {messages.length === 0 && !loadError && (
          <div className="coop-chat-empty">아직 대화가 없습니다. 첫 메시지를 보내보세요.</div>
        )}
        {messages.map((m, i) => (
          <div key={m.coopMessageId ?? i} className={"coop-chat-bubble-row" + (m.mine ? " mine" : "")}>
            {!m.mine && <div className="coop-chat-sender">{m.senderName || `의사 #${m.senderDoctorId}`}</div>}
            <div className="coop-chat-bubble">{m.content}</div>
            <div className="coop-chat-time">
              {m.mine && <span className="coop-chat-read">{m.read ? "읽음" : "안읽음"}</span>}
              {m.sentAt ? m.sentAt.slice(5, 16) : ""}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="coop-chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          className="coop-chat-input"
          placeholder={connected ? "메시지를 입력하세요" : "연결 중..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!connected}
        />
        <button type="submit" className="btn-coop-apply" disabled={!connected || !input.trim()}>
          전송
        </button>
      </form>
    </div>
  );
}

export default CoopChatPanel;