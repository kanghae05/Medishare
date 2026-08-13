import { useEffect, useRef, useState } from "react";
import api from "../common/api";
import "./Coop.css";

// 이름/세부전공/진료과명으로 의사를 검색하는 자동완성 입력창.
// 선택하면 onSelect(doctor)로 { no, name, departmentName, specialty, position }을 넘겨준다.
function DoctorAutocomplete({ value, onSelect, placeholder }) {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // 바깥 클릭하면 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 디바운스 검색 - 입력 멈추고 300ms 후에 요청
  useEffect(() => {
    if (!query || query === value?.name) {
      setResults([]);
      return;
    }
    let ignore = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/coop/lookup/doctors.do", { params: { q: query } })
        .then((res) => {
          if (!ignore) {
            setResults(res.data || []);
            setOpen(true);
          }
        })
        .catch(() => {
          if (!ignore) setResults([]);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSelect = (doctor) => {
    setQuery(doctor.name);
    setOpen(false);
    onSelect(doctor);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (value) onSelect(null); // 다시 타이핑 시작하면 이전 선택 해제
  };

  return (
    <div className="coop-autocomplete" ref={containerRef}>
      <input
        type="text"
        className="coop-form-input"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder || "이름으로 검색"}
        autoComplete="off"
      />
      {open && (
        <div className="coop-autocomplete-dropdown">
          {loading ? (
            <div className="coop-autocomplete-empty">검색 중...</div>
          ) : results.length === 0 ? (
            <div className="coop-autocomplete-empty">검색 결과가 없습니다.</div>
          ) : (
            results.map((d) => (
              <div key={d.no} className="coop-autocomplete-item" onClick={() => handleSelect(d)}>
                <span className="coop-autocomplete-name">{d.name}</span>
                <span className="coop-autocomplete-meta">
                  {[d.departmentName, d.specialty, d.position].filter(Boolean).join(" · ")}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorAutocomplete;