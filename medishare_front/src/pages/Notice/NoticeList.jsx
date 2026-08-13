import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotices } from "./noticeApi";
import "./Notice.css";

export default function NoticeList() {
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const loggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    getNotices({ keyword, page, size: 10 })
      .then(setData)
      .catch(() => setData({ content: [], totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [keyword, page]);

  return (
    <div className="notice-shell">
      <section className="notice-page">
        <header className="notice-page-head">
          <div>
            <h1>공지사항</h1>
            <p>메디쉐어의 새로운 소식과 주요 안내를 확인하세요.</p>
          </div>
          {loggedIn && (
            <Link className="notice-primary" to="/notices/new">
              공지 작성
            </Link>
          )}
        </header>

        <div className="notice-filter">
          <input
            aria-label="공지사항 제목 검색"
            placeholder="제목 검색"
            value={keyword}
            onChange={(event) => {
              setLoading(true);
              setKeyword(event.target.value);
              setPage(0);
            }}
          />
        </div>

        <div className="notice-card notice-list-card">
          {loading ? (
            <div className="notice-state">공지사항을 불러오는 중입니다.</div>
          ) : data.content.length === 0 ? (
            <div className="notice-state">등록된 공지사항이 없습니다.</div>
          ) : (
            data.content.map((notice) => (
              <Link className="notice-row" to={`/notices/${notice.noticeId}`} key={notice.noticeId}>
                <div className="notice-row-title">
                  {notice.pinned && <span className="notice-pin">중요</span>}
                  <strong>{notice.title}</strong>
                </div>
                <div className="notice-row-meta">
                  <span>{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString("ko-KR") : ""}</span>
                  <span>조회 {notice.views ?? 0}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        <nav className="notice-pagination" aria-label="공지사항 페이지 이동">
          <button disabled={page === 0} onClick={() => { setLoading(true); setPage((current) => current - 1); }}>이전</button>
          <span><strong>{page + 1}</strong> / {Math.max(data.totalPages, 1)}</span>
          <button disabled={page + 1 >= data.totalPages} onClick={() => { setLoading(true); setPage((current) => current + 1); }}>다음</button>
        </nav>
      </section>
    </div>
  );
}
