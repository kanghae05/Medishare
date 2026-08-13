import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getNotice, saveNotice } from "./noticeApi";
import "./Notice.css";

export default function NoticeForm() {
  const { noticeId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", pinned: false });

  useEffect(() => {
    if (noticeId) getNotice(noticeId).then(setForm);
  }, [noticeId]);

  const change = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const saved = await saveNotice(noticeId, form);
    navigate(`/notices/${saved.noticeId}`);
  };

  return (
    <div className="notice-shell">
      <section className="notice-page">
        <header className="notice-page-head">
          <div>
            <h1>공지사항 {noticeId ? "수정" : "작성"}</h1>
            <p>사용자에게 전달할 공지 내용을 입력하세요.</p>
          </div>
        </header>
        <form className="notice-form-card" onSubmit={submit}>
          <label><span>제목</span><input required name="title" value={form.title} onChange={change} placeholder="제목을 입력하세요" /></label>
          <label><span>내용</span><textarea required rows="14" name="content" value={form.content} onChange={change} placeholder="공지 내용을 입력하세요" /></label>
          <label className="notice-check"><input type="checkbox" name="pinned" checked={form.pinned} onChange={change} /><span>목록 상단에 중요 공지로 고정</span></label>
          <div className="notice-actions"><Link className="notice-secondary" to={noticeId ? `/notices/${noticeId}` : "/notices"}>취소</Link><button className="notice-primary">저장</button></div>
        </form>
      </section>
    </div>
  );
}
