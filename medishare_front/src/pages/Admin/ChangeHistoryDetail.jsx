import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../../components/common/api";

const formatDateTime = (value) => value ? new Date(value).toLocaleString("ko-KR") : "-";

const Snapshot = ({ title, value }) => {
  if (!value) return <div className="col-md-6"><h5>{title}</h5><div className="card card-body text-muted">데이터 없음</div></div>;
  try {
    const entries = Object.entries(JSON.parse(value));
    return <div className="col-md-6"><h5>{title}</h5><div className="card"><table className="table table-sm mb-0"><tbody>{entries.map(([key, entryValue]) => <tr key={key}><th>{key}</th><td className="text-break">{String(entryValue ?? "-")}</td></tr>)}</tbody></table></div></div>;
  } catch {
    return <div className="col-md-6"><h5>{title}</h5><div className="card card-body text-break">{value}</div></div>;
  }
};

export default function ChangeHistoryDetail({ isAdmin }) {
  const { historyNo } = useParams();
  const [history, setHistory] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    api.get(`/api/admin/change-logs/${historyNo}`).then((response) => setHistory(response.data))
      .catch((error) => setMessage(error.response?.data?.message || "변경 이력 상세 정보를 불러오지 못했습니다."));
  }, [isAdmin, historyNo]);

  if (!isAdmin) return <Navigate to="/" replace />;
  if (!history) return <div>{message || "불러오는 중..."}</div>;
  const rows = [
    ["이력 번호", history.historyNo], ["변경 시간", formatDateTime(history.changedAt)], ["변경자", `${history.memberName} (${history.loginId})`],
    ["진료과", history.departmentName || "-"], ["환자 ID", history.patientId || (history.patientNo ? `#${history.patientNo}` : "-")],
    ["Study 번호", history.studyNo || "-"], ["Study UID", history.studyInstanceUid || "-"], ["데이터 유형", history.dataType],
    ["변경 유형", history.actionType], ["변경 사유", history.changeReason || "-"],
  ];
  return <div>
    <div className="d-flex justify-content-between align-items-center mb-3"><h2>변경 이력 상세</h2><Link className="btn btn-outline-secondary" to="/admin/change-logs">목록으로</Link></div>
    <div className="card mb-4"><div className="card-body"><table className="table mb-0"><tbody>{rows.map(([label, value]) => <tr key={label}><th style={{ width: "30%" }}>{label}</th><td>{value}</td></tr>)}</tbody></table></div></div>
    <div className="row g-3"><Snapshot title="변경 전" value={history.beforeData} /><Snapshot title="변경 후" value={history.afterData} /></div>
  </div>;
}
