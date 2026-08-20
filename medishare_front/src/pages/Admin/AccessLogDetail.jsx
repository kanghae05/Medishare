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

export default function AccessLogDetail({ isAdmin }) {
  const { logNo } = useParams();
  const [log, setLog] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    api
      .get(`/api/admin/access-logs/${logNo}`)
      .then((response) => setLog(response.data))
      .catch((error) =>
        setMessage(
          error.response?.data?.message ||
            "접근 이력 상세 정보를 불러오지 못했습니다.",
        ),
      );
  }, [isAdmin, logNo]);

  if (!isAdmin) return <Navigate to="/" replace />;

  if (!log) {
    return (
      <section className="admin-audit-page">
        <div className="admin-audit-loading">
          {message || "접근 이력을 불러오는 중입니다."}
        </div>
      </section>
    );
  }

  return (
    <section className="admin-audit-page">
      <div className="admin-audit-hero compact">
        <div>
          <span className="admin-audit-eyebrow">ACCESS DETAIL</span>
          <h1>접근 이력 상세</h1>
          <p>의료 데이터 접근 시간, 사용자, 결과 정보를 상세 확인합니다.</p>
        </div>
        <Link className="admin-audit-back" to="/admin/access-logs">
          목록으로
        </Link>
      </div>

      <div className="admin-audit-detail-card">
        <div className="admin-audit-detail-title">
          <span
            className={`admin-audit-badge ${
              log.accessResult === "SUCCESS" ? "success" : "danger"
            }`}
          >
            {log.accessResult}
          </span>
          <h2>Log #{log.logNo}</h2>
        </div>

        <div className="admin-audit-detail-grid">
          <DetailRow label="접근 시간" value={formatDateTime(log.accessedAt)} />
          <DetailRow
            label="의료진"
            value={`${log.memberName || "-"} (${log.loginId || "-"})`}
          />
          <DetailRow label="진료과" value={log.departmentName} />
          <DetailRow
            label="환자 ID"
            value={log.patientId || (log.patientNo ? `#${log.patientNo}` : "-")}
          />
          <DetailRow label="Study 번호" value={log.studyNo} />
          <DetailRow label="Study UID" value={log.studyInstanceUid} />
          <DetailRow label="데이터 유형" value={log.dataType} />
          <DetailRow label="행동" value={log.actionType} />
          <DetailRow label="IP 주소" value={log.ipAddress} />
        </div>
      </div>
    </section>
  );
}
