import { useEffect, useRef, useState } from "react";
import api from "../common/api";
import "./Coop.css";

// DoctorAutocomplete.jsx와 동일한 패턴 - 환자 이름으로 검색.
// 선택하면 onSelect(patient)로 { no, patientName, patientSex, patientBirthDate }를 넘겨준다.
function PatientAutocomplete({ value, onSelect, placeholder }) {
  const [query, setQuery] = useState(value?.patientName || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query === value?.patientName) {
      setResults([]);
      return;
    }
    let ignore = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/coop/lookup/patients.do", { params: { q: query } })
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

  const handleSelect = (patient) => {
    setQuery(patient.patientName);
    setOpen(false);
    onSelect(patient);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (value) onSelect(null);
  };

  const formatMeta = (p) => {
    const parts = [];
    if (p.patientSex) parts.push(p.patientSex === "M" ? "남" : p.patientSex === "F" ? "여" : p.patientSex);
    if (p.patientBirthDate && p.patientBirthDate.length === 8) {
      parts.push(`${p.patientBirthDate.slice(0, 4)}-${p.patientBirthDate.slice(4, 6)}-${p.patientBirthDate.slice(6, 8)}`);
    }
    return parts.join(" · ");
  };

  return (
    <div className="coop-autocomplete" ref={containerRef}>
      <input
        type="text"
        className="coop-form-input"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={placeholder || "환자 이름으로 검색"}
        autoComplete="off"
      />
      {open && (
        <div className="coop-autocomplete-dropdown">
          {loading ? (
            <div className="coop-autocomplete-empty">검색 중...</div>
          ) : results.length === 0 ? (
            <div className="coop-autocomplete-empty">검색 결과가 없습니다.</div>
          ) : (
            results.map((p) => (
              <div key={p.no} className="coop-autocomplete-item" onClick={() => handleSelect(p)}>
                <span className="coop-autocomplete-name">{p.patientName}</span>
                <span className="coop-autocomplete-meta">{formatMeta(p)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PatientAutocomplete;