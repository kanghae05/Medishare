import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../../components/common/api";
import "./AdminAudit.css";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("ko-KR") : "-";

function DetailRow({ label, value }) {
  return (
    <div className="admin-audit-detail-row">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

function Snapshot({ title, value }) {
  if (!value) {
    return (
      <div className="admin-audit-snapshot">
        <h3>{title}</h3>
        <div className="admin-audit-empty compact">데이터 없음</div>
      </div>
    );
  }

  try {
    const entries = Object.entries(JSON.parse(value));

    return (
      <div className="admin-audit-snapshot">
        <h3>{title}</h3>
        <div className="admin-audit-snapshot-list">
          {entries.map(([key, entryValue]) => (
            <div key={key}>
              <span>{key}</span>
              <strong>{String(entryValue ?? "-")}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  } catch {
    return (
      <div className="admin-audit-snapshot">
        <h3>{title}</h3>
        <pre>{value}</pre>
      </div>
    );
  }
}

export default function ChangeHistoryDetail({ isAdmin }) {
  const { historyNo } = useParams();
  const [history, setHistory] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    api
      .get(`/api/admin/change-logs/${historyNo}`)
      .then((response) => setHistory(response.data))
      .catch((error) =>
        setMessage(
          error.response?.data?.message ||
            "변경 이력 상세 정보를 불러오지 못했습니다.",
        ),
      );
  }, [isAdmin, historyNo]);

  if (!isAdmin) return <Navigate to="/" replace />;

  if (!history) {
    return (
      <section className="admin-audit-page">
        <div className="admin-audit-loading">
          {message || "변경 이력을 불러오는 중입니다."}
        </div>
      </section>
    );
  }

  return (
    <section className="admin-audit-page">
      <div className="admin-audit-hero compact">
        <div>
          <span className="admin-audit-eyebrow">CHANGE DETAIL</span>
          <h1>변경 이력 상세</h1>
          <p>판독소견 변경 전후 데이터와 변경 사유를 확인합니다.</p>
        </div>
        <Link className="admin-audit-back" to="/admin/change-logs">
          목록으로
        </Link>
      </div>

      <div className="admin-audit-detail-card">
        <div className="admin-audit-detail-title">
          <span
            className={`admin-audit-badge ${String(
              history.actionType,
            ).toLowerCase()}`}
          >
            {history.actionType}
          </span>
          <h2>History #{history.historyNo}</h2>
        </div>

        <div className="admin-audit-detail-grid">
          <DetailRow
            label="변경 시간"
            value={formatDateTime(history.changedAt)}
          />
          <DetailRow
            label="변경자"
            value={`${history.memberName || "-"} (${history.loginId || "-"})`}
          />
          <DetailRow label="진료과" value={history.departmentName} />
          <DetailRow
            label="환자 ID"
            value={
              history.patientId ||
              (history.patientNo ? `#${history.patientNo}` : "-")
            }
          />
          <DetailRow label="Study 번호" value={history.studyNo} />
          <DetailRow label="Study UID" value={history.studyInstanceUid} />
          <DetailRow label="데이터 유형" value={history.dataType} />
          <DetailRow label="변경 유형" value={history.actionType} />
          <DetailRow label="변경 사유" value={history.changeReason} />
        </div>
      </div>

      <div className="admin-audit-snapshot-grid">
        <Snapshot title="변경 전" value={history.beforeData} />
        <Snapshot title="변경 후" value={history.afterData} />
      </div>
    </section>
  );
}
