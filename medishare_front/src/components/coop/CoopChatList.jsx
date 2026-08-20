import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../common/api";
import "./Coop.css";

function formatTime(str) {
  if (!str) return "";
  const [date, time] = str.split(" ");
  return `${date} ${time.slice(0, 5)}`;
}

// 채팅 - 내가 참여 중인 채팅방(수락된 협진요청) 목록. 최근 대화순 정렬, 방마다 마지막 메시지 + 안읽은 개수 표시.
// 같은 상대방과도 협진요청이 다르면 채팅방이 따로 생기므로, 이름 옆에 그 협진요청의 날짜를 같이 보여준다.
function CoopChatList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // location.key가 이 화면에 "들어올 때마다" 바뀌므로, 채팅방 갔다가 돌아올 때도 항상 새로 불러온다.
  // (새로고침 없이도 방금 읽은 채팅의 안읽음 표시가 바로 없어지게 하기 위함)
  useEffect(() => {
    let ignore = false;
    queueMicrotask(() => {
      if (!ignore) setLoading(true);
    });
    api
      .get("/coop/chats.do")
      .then((res) => {
        if (!ignore) setRooms(res.data || []);
      })
      .catch(() => {
        if (!ignore) setError("채팅 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [location.key]);

  return (
    <div className="coop-page">
      <div className="coop-header">
        <h3 className="coop-title">채팅</h3>
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
                  {r.reqDate && <span className="coop-chat-req-date">협진요청 {r.reqDate}</span>}
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