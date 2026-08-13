import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../../components/common/api";

const formatDateTime = (value) => value ? new Date(value).toLocaleString("ko-KR") : "-";

export default function AccessLogDetail({ isAdmin }) {
  const { logNo } = useParams();
  const [log, setLog] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    api.get(`/api/admin/access-logs/${logNo}`).then((response) => setLog(response.data))
      .catch((error) => setMessage(error.response?.data?.message || "접근 이력 상세 정보를 불러오지 못했습니다."));
  }, [isAdmin, logNo]);

  if (!isAdmin) return <Navigate to="/" replace />;
  if (!log) return <div>{message || "불러오는 중..."}</div>;
  const rows = [
    ["로그 번호", log.logNo], ["접근 시간", formatDateTime(log.accessedAt)], ["의료진", `${log.memberName} (${log.loginId})`],
    ["진료과", log.departmentName || "-"], ["환자 ID", log.patientId || (log.patientNo ? `#${log.patientNo}` : "-")],
    ["Study 번호", log.studyNo || "-"], ["Study UID", log.studyInstanceUid || "-"], ["데이터 유형", log.dataType],
    ["행동", log.actionType], ["접근 결과", log.accessResult], ["IP 주소", log.ipAddress || "-"],
  ];
  return <div>
    <div className="d-flex justify-content-between align-items-center mb-3"><h2>접근 이력 상세</h2><Link className="btn btn-outline-secondary" to="/admin/access-logs">목록으로</Link></div>
    <div className="card"><div className="card-body"><table className="table mb-0"><tbody>{rows.map(([label, value]) => <tr key={label}><th style={{ width: "30%" }}>{label}</th><td>{value}</td></tr>)}</tbody></table></div></div>
  </div>;
}
