import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSpecialCases } from "./specialCaseApi";
import "./SpecialCase.css";

const FILTERS = [
  ["modality", ["CT", "MRI", "X-Ray", "US"]],
  ["bodyPart", ["Brain", "Chest", "Abdomen", "Spine"]],
];

export default function SpecialCaseList() {
  const [query, setQuery] = useState({ page: 0, size: 12, sort: "createdAt", modality: "", bodyPart: "", keyword: "" });
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loggedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    setError("");
    getSpecialCases(query)
      .then(setData)
      .catch((requestError) => {
        setData({ content: [], totalPages: 0 });
        setError(
          requestError.response?.status === 401
            ? "로그인 세션이 만료되었습니다. 다시 로그인해 주세요."
            : requestError.response?.data?.message || "특이케이스 목록을 불러오지 못했습니다."
        );
      })
      .finally(() => setLoading(false));
  }, [query]);

  const setFilter = (key, value) => {
    setLoading(true);
    setQuery((current) => ({ ...current, [key]: value, page: 0 }));
  };

  return (
    <div className="case-shell">
      <section className="case-page">
        <header className="case-page-head">
          <div><h1>특이케이스 라이브러리</h1><p>임상에서 확인된 주요 영상 판독 사례를 찾아보세요.</p></div>
          {loggedIn && <Link className="case-primary" to="/special-cases/new">케이스 등록</Link>}
        </header>

        <div className="case-filter">
          <input aria-label="특이케이스 검색" placeholder="제목·소견·태그 검색" value={query.keyword} onChange={(event) => setFilter("keyword", event.target.value)} />
          {FILTERS.map(([key, values]) => (
            <select aria-label={key === "modality" ? "검사 종류" : "촬영 부위"} key={key} value={query[key]} onChange={(event) => setFilter(key, event.target.value)}>
              <option value="">전체</option>
              {values.map((value) => <option key={value}>{value}</option>)}
            </select>
          ))}
          <select aria-label="정렬 기준" value={query.sort} onChange={(event) => setFilter("sort", event.target.value)}><option value="createdAt">최신순</option><option value="views">조회순</option></select>
        </div>

        {loading ? <div className="case-state">특이케이스를 불러오는 중입니다.</div> : error ? <div className="case-state case-state-error">{error}</div> : data.content.length === 0 ? <div className="case-state">등록된 특이케이스가 없습니다.</div> : (
          <div className="case-grid">
            {data.content.map((item) => (
              <Link className="case-card" to={`/special-cases/${item.caseId}`} key={item.caseId}>
                <div className="case-card-body"><div className="case-badges"><span>{item.modality}</span><span>{item.bodyPart}</span></div><h2>{item.title}</h2><p>{item.findings}</p><small>조회 {item.views ?? 0}</small></div>
              </Link>
            ))}
          </div>
        )}

        <nav className="case-pagination" aria-label="특이케이스 페이지 이동"><button disabled={query.page === 0} onClick={() => { setLoading(true); setQuery((current) => ({ ...current, page: current.page - 1 })); }}>이전</button><span><strong>{query.page + 1}</strong> / {Math.max(data.totalPages, 1)}</span><button disabled={query.page + 1 >= data.totalPages} onClick={() => { setLoading(true); setQuery((current) => ({ ...current, page: current.page + 1 })); }}>다음</button></nav>
      </section>
    </div>
  );
}
