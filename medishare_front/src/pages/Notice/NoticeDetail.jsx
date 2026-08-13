import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteNotice, getNotice } from "./noticeApi";
import "./Notice.css";

export default function NoticeDetail({ isAdmin = false }) {
  const { noticeId } = useParams();
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getNotice(noticeId).then(setNotice);
  }, [noticeId]);

  if (!notice) return <div className="notice-shell"><div className="notice-state">공지사항을 불러오는 중입니다.</div></div>;

  const removeNotice = async () => {
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
    await deleteNotice(noticeId);
    navigate("/notices");
  };

  return (
    <div className="notice-shell">
      <article className="notice-page">
        <div className="notice-detail-card">
          <header className="notice-detail-head">
            <div className="notice-row-title">
              {notice.pinned && <span className="notice-pin">중요</span>}
              <h1>{notice.title}</h1>
            </div>
            <p>{new Date(notice.createdAt).toLocaleString("ko-KR")} · 조회 {notice.views ?? 0}</p>
          </header>
          <div className="notice-content">{notice.content}</div>
        </div>
        <div className="notice-actions">
          <Link className="notice-secondary" to="/notices">목록</Link>
          {isAdmin && <Link className="notice-secondary" to={`/notices/${noticeId}/edit`}>수정</Link>}
          {isAdmin && <button className="notice-danger" onClick={removeNotice}>삭제</button>}
        </div>
      </article>
    </div>
  );
}
