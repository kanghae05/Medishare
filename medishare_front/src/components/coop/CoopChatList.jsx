import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../common/api";
import "./Coop.css";

function formatTime(str) {
  if (!str) return "";
  const [date, time] = str.split(" ");
  return `${date} ${time.slice(0, 5)}`;
}

// 대화함 - 내가 참여 중인 채팅방(수락된 협진요청) 목록. 방마다 마지막 메시지 + 안읽은 개수 표시.
function CoopChatList() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    api
      .get("/coop/chats.do")
      .then((res) => {
        if (!ignore) setRooms(res.data || []);
      })
      .catch(() => {
        if (!ignore) setError("대화함을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="coop-page">
      <div className="coop-header">
        <h3 className="coop-title">대화함</h3>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">불러오는 중...</div>
      ) : error ? (
        <div className="coop-empty">{error}</div>
      ) : rooms.length === 0 ? (
        <div className="coop-empty">참여 중인 채팅방이 없습니다. (협진 요청이 수락되면 채팅이 열립니다)</div>
      ) : (
        <div className="coop-ledger">
          {rooms.map((r) => (
            <div
              key={r.coopRequestId}
              className={"coop-ledger-row" + (r.unreadCount > 0 ? " unread" : "")}
              style={{ gridTemplateColumns: "1fr 44px 130px" }}
              onClick={() => navigate(`/coop/chat?no=${r.coopRequestId}`)}
            >
              <div className="coop-ledger-main">
                <div className="coop-row-top">
                  <span className={"coop-row-counterpart-primary" + (r.unreadCount > 0 ? " unread" : "")}>
                    {r.counterpartName || `의사 #${r.coopRequestId}`}
                    {r.counterpartMeta && <span className="coop-doctor-meta"> ({r.counterpartMeta})</span>}
                  </span>
                </div>
                <div className="coop-row-content">
                  {r.lastMessage || "아직 대화가 없습니다."}
                </div>
              </div>
              <span>
                {r.unreadCount > 0 && <span className="count-badge">{r.unreadCount}</span>}
              </span>
              <span className="coop-ledger-col-time coop-row-time">{formatTime(r.lastMessageTime)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoopChatList;