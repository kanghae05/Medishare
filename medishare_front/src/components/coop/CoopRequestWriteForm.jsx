import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../common/api";
import DoctorAutocomplete from "./DoctorAutocomplete";
import PatientAutocomplete from "./PatientAutocomplete";
import "./Coop.css";

function formatStudyDate(raw) {
  if (!raw || raw.length !== 8) return raw || "";
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function formatStudyTime(raw) {
  if (!raw || raw.length < 4) return "";
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}`;
}

function formatStudyDateTime(date, time) {
  const d = formatStudyDate(date);
  const t = formatStudyTime(time);
  if (!d) return "";
  return t ? `${d} ${t}` : d;
}

function CoopRequestWriteForm() {
  const [searchParams] = useSearchParams();
  const originRequestId = searchParams.get("originRequestId");
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(null); // 재요청일 때 원본 요청 정보 (인용 + 읽기전용 표시용)

  const [recvType, setRecvType] = useState("지정의사");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [recvDeptId, setRecvDeptId] = useState("");
  const [departments, setDepartments] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null); // { no, patientName, ... }
  const [studies, setStudies] = useState([]);
  const [selectedStudyId, setSelectedStudyId] = useState("");
  const selectedStudy = studies.find((s) => String(s.no) === String(selectedStudyId)) || null;
  const [studiesLoading, setStudiesLoading] = useState(false);

  const [availableReport, setAvailableReport] = useState(null); // { no, title, status } | null
  const [attachReport, setAttachReport] = useState(false);

  const [reqContent, setReqContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 진료과 목록은 개수가 적어 전체를 한 번에 불러온다.
  useEffect(() => {
    let ignore = false;
    api
      .get("/coop/lookup/departments.do")
      .then((res) => {
        if (!ignore) setDepartments(res.data || []);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // 재요청이면 원본 요청 정보를 불러온다 (환자/검사/소견서는 자동 복사, 화면엔 읽기전용으로 표시).
  useEffect(() => {
    if (!originRequestId) return;
    let ignore = false;
    api
      .get("/coop/view.do", { params: { no: originRequestId } })
      .then((res) => {
        if (!ignore) setOrigin(res.data);
      })
      .catch(() => {
        if (!ignore) setError("원본 협진 요청 정보를 불러오지 못했습니다.");
      });
    return () => {
      ignore = true;
    };
  }, [originRequestId]);

  // 환자를 선택하면 그 환자의 검사 목록을 불러온다.
  useEffect(() => {
    let ignore = false;

    if (!selectedPatient) {
      queueMicrotask(() => {
        if (!ignore) {
          setStudies([]);
          setSelectedStudyId("");
        }
      });
      return () => {
        ignore = true;
      };
    }

    queueMicrotask(() => {
      if (!ignore) setStudiesLoading(true);
    });
    api
      .get(`/coop/lookup/patients/${selectedPatient.no}/studies.do`)
      .then((res) => {
        if (!ignore) setStudies(res.data || []);
      })
      .catch(() => {
        if (!ignore) setStudies([]);
      })
      .finally(() => {
        if (!ignore) setStudiesLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedPatient]);

  // 검사를 선택하면 그 검사의 소견서 존재 여부를 확인한다.
  useEffect(() => {
    let ignore = false;

    if (!selectedStudyId) {
      queueMicrotask(() => {
        if (!ignore) {
          setAvailableReport(null);
          setAttachReport(false);
        }
      });
      return () => {
        ignore = true;
      };
    }

    api
      .get(`/coop/lookup/studies/${selectedStudyId}/report.do`)
      .then((res) => {
        if (ignore) return;
        const report = (res.data && res.data[0]) || null;
        setAvailableReport(report);
        setAttachReport(false); // 검사 바뀔 때마다 체크 초기화
      })
      .catch(() => {
        if (!ignore) setAvailableReport(null);
      });
    return () => {
      ignore = true;
    };
  }, [selectedStudyId]);

  const validate = () => {
    if (originRequestId) {
      if (recvType === "지정의사" && !selectedDoctor) return "수신 의사를 검색해서 선택해주세요.";
      if (recvType === "진료과" && !recvDeptId) return "수신 진료과를 선택해주세요.";
      if (!reqContent.trim()) return "요청 내용을 입력해주세요.";
      return null;
    }
    if (recvType === "지정의사" && !selectedDoctor) return "수신 의사를 검색해서 선택해주세요.";
    if (recvType === "진료과" && !recvDeptId) return "수신 진료과를 선택해주세요.";
    if (!selectedPatient) return "환자를 검색해서 선택해주세요.";
    if (!selectedStudyId) return "검사를 선택해주세요.";
    if (!reqContent.trim()) return "요청 내용을 입력해주세요.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      recvType,
      recvDoctorId: recvType === "지정의사" ? selectedDoctor.no : null,
      recvDeptId: recvType === "진료과" ? Number(recvDeptId) : null,
      pacsStudyId: originRequestId ? null : Number(selectedStudyId),
      reportId: originRequestId ? null : attachReport && availableReport ? availableReport.no : null,
      reqContent,
      originRequestId: originRequestId ? Number(originRequestId) : null,
    };

    api
      .post("/coop/write.do", payload)
      .then(() => {
        navigate("/coop/sent");
      })
      .catch((err) => {
        const message =
          err.response?.data?.message || err.response?.data?.error || "협진 요청 등록에 실패했습니다.";
        setError(message);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="coop-page">
      <h3 className="coop-title" style={{ marginBottom: 20 }}>
        {originRequestId ? "협진 재요청" : "협진 요청 등록"}
      </h3>

      {origin && (
        <div className="coop-quote-box">
          <div className="coop-quote-label">기존 요청 내용 ({origin.reqTime})</div>
          <div className="coop-quote-content">"{origin.reqContent}"</div>
          {origin.rejectReason && (
            <div className="coop-quote-reason">거절 사유: "{origin.rejectReason}"</div>
          )}
        </div>
      )}

      <form className="coop-form" onSubmit={handleSubmit}>
        <div className="coop-form-row">
          <label className="coop-form-label">수신 대상</label>
          <div className="coop-chip-group">
            <button
              type="button"
              className={"coop-chip" + (recvType === "지정의사" ? " active" : "")}
              onClick={() => setRecvType("지정의사")}
            >
              지정의사
            </button>
            <button
              type="button"
              className={"coop-chip" + (recvType === "진료과" ? " active" : "")}
              onClick={() => setRecvType("진료과")}
            >
              진료과
            </button>
          </div>
        </div>

        {recvType === "지정의사" ? (
          <div className="coop-form-row">
            <label className="coop-form-label">받는 의사</label>
            <DoctorAutocomplete
              value={selectedDoctor}
              onSelect={setSelectedDoctor}
              placeholder="이름, 진료과, 세부전공으로 검색"
            />
          </div>
        ) : (
          <div className="coop-form-row">
            <label className="coop-form-label">받는 진료과</label>
            <select
              className="coop-form-input"
              value={recvDeptId}
              onChange={(e) => setRecvDeptId(e.target.value)}
            >
              <option value="">진료과 선택</option>
              {departments.map((d) => (
                <option key={d.no} value={d.no}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>
        )}

        {originRequestId ? (
          <>
            <div className="coop-form-row">
              <label className="coop-form-label">환자</label>
              <div className="coop-form-readonly">{origin?.patientName || "-"}</div>
            </div>
            <div className="coop-form-row">
              <label className="coop-form-label">검사</label>
              <div className="coop-form-readonly">{origin?.pacsStudyLabel || "-"}</div>
            </div>
          </>
        ) : (
          <>
            <div className="coop-form-row">
              <label className="coop-form-label">환자</label>
              <PatientAutocomplete value={selectedPatient} onSelect={setSelectedPatient} />
            </div>

            {selectedPatient && (
              <div className="coop-form-row">
                <label className="coop-form-label">검사</label>
                <select
                  className="coop-form-input"
                  value={selectedStudyId}
                  onChange={(e) => setSelectedStudyId(e.target.value)}
                  disabled={studiesLoading}
                >
                  <option value="">
                    {studiesLoading
                      ? "불러오는 중..."
                      : studies.length === 0
                      ? "이 환자의 검사가 없습니다"
                      : "검사 선택"}
                  </option>
                  {studies.map((s) => (
                    <option key={s.no} value={s.no}>
                      {s.studyDescription || `검사 #${s.no}`}
                      {s.instanceCount ? ` · ${s.instanceCount}장` : ""} ({formatStudyDateTime(s.studyDate, s.studyTime)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedStudy?.requestedProcedureDescription && (
              <div className="coop-form-row">
                <label className="coop-form-label"></label>
                <div className="coop-study-reason">
                  요청 사유: {selectedStudy.requestedProcedureDescription}
                </div>
              </div>
            )}

            {availableReport && (
              <div className="coop-form-row">
                <label className="coop-form-label"></label>
                <label className="coop-filter-checkbox">
                  <input
                    type="checkbox"
                    checked={attachReport}
                    onChange={(e) => setAttachReport(e.target.checked)}
                  />
                  이 검사의 소견서 "{availableReport.title}" 첨부 (
                  {availableReport.status === "FINAL" ? "최종 확정" : availableReport.status === "DRAFT" ? "작성 중" : availableReport.status})
                </label>
              </div>
            )}
          </>
        )}

        <div className="coop-form-row align-top">
          <label className="coop-form-label">요청 내용</label>
          <textarea
            className="coop-form-textarea"
            rows={5}
            value={reqContent}
            onChange={(e) => setReqContent(e.target.value)}
            placeholder="협진 요청 내용을 입력하세요."
          />
        </div>

        {error && <div className="coop-form-error">{error}</div>}

        <div className="coop-form-actions">
          <button type="button" className="btn-coop-reset" onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit" className="btn-coop-apply" disabled={submitting}>
            {submitting ? "등록 중..." : originRequestId ? "재요청 보내기" : "요청 보내기"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CoopRequestWriteForm;