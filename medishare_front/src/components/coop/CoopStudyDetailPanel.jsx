import { useEffect, useState } from "react";
import api from "../common/api";
import "./Coop.css";

function formatDate(raw) {
  if (!raw || raw.length !== 8) return raw || "-";
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function formatTime(raw) {
  if (!raw || raw.length < 4) return "";
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}`;
}

function formatSex(sex) {
  if (sex === "M") return "남";
  if (sex === "F") return "여";
  return sex || "-";
}

// 협진 상세화면의 환자/검사 상세 정보 패널. 기술 정보(Orthanc/DICOM ID)는 평소엔 접어둔다.
function CoopStudyDetailPanel({ pacsStudyId }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [showTechInfo, setShowTechInfo] = useState(false);

  useEffect(() => {
    if (!pacsStudyId) return;
    let ignore = false;
    api
      .get(`/coop/study/${pacsStudyId}/detail.do`)
      .then((res) => {
        if (!ignore) setDetail(res.data);
      })
      .catch(() => {
        if (!ignore) setError("상세 정보를 불러오지 못했습니다.");
      });
    return () => {
      ignore = true;
    };
  }, [pacsStudyId]);

  if (error) return null; // 조용히 생략 - 기본 정보(환자명, 검사명)는 이미 위 카드에 나와 있음
  if (!detail) return null;

  return (
    <div className="coop-detail-pane">
      <div className="coop-detail-section">
        <div className="coop-detail-section-title">환자 정보</div>
        <div className="coop-detail-grid">
          <div><span className="coop-detail-label">환자번호</span>{detail.patientIdText || `#${detail.patientNo}`}</div>
          <div><span className="coop-detail-label">성별</span>{formatSex(detail.patientSex)}</div>
          <div><span className="coop-detail-label">이름</span>{detail.patientName || "-"}</div>
          <div><span className="coop-detail-label">나이</span>{detail.age != null ? `만 ${detail.age}세` : "-"}</div>
        </div>
      </div>

      <div className="coop-detail-section">
        <div className="coop-detail-section-title">검사 정보</div>
        <div className="coop-detail-grid">
          <div><span className="coop-detail-label">접수번호</span>{detail.accessionNumber || "-"}</div>
          <div><span className="coop-detail-label">촬영일시</span>{formatDate(detail.studyDate)} {formatTime(detail.studyTime)}</div>
          <div><span className="coop-detail-label">촬영종류</span>{detail.modality || "-"}</div>
          <div><span className="coop-detail-label">영상 수</span>{detail.instanceCount != null ? `${detail.instanceCount}장` : "-"}</div>
          <div><span className="coop-detail-label">의뢰의사</span>{detail.referringPhysicianName || "-"}</div>
          <div className="coop-detail-span2"><span className="coop-detail-label">검사설명</span>{detail.studyDescription || "-"}</div>
          <div className="coop-detail-span2"><span className="coop-detail-label">요청사유</span>{detail.requestedProcedureDescription || "-"}</div>
          <div className="coop-detail-span2"><span className="coop-detail-label">시리즈설명</span>{detail.seriesDescription || "-"}</div>
        </div>
      </div>

      <button type="button" className="coop-detail-tech-toggle" onClick={() => setShowTechInfo((v) => !v)}>
        기술 정보 {showTechInfo ? "숨기기 ▲" : "보기 ▾"}
      </button>
      {showTechInfo && (
        <div className="coop-detail-tech-box">
          <div><span className="coop-detail-label">Orthanc Study ID</span>{detail.orthancStudyId || "-"}</div>
          <div><span className="coop-detail-label">Study Instance UID</span>{detail.studyInstanceUid || "-"}</div>
          <div><span className="coop-detail-label">Orthanc Patient ID</span>{detail.orthancPatientId || "-"}</div>
        </div>
      )}
    </div>
  );
}

export default CoopStudyDetailPanel;