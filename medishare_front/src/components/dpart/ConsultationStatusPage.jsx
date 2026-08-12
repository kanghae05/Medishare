import { useCallback, useEffect, useState } from "react";
import { getConsultationStatistics, getDoctorConsultationStatistics } from "../../api/statisticsApi";
import LoadingState from "./LoadingState";
import StatCard from "./StatCard";
import { currentUser, extractErrorMessage, todayString } from "./dpartUtils";

const statusCards = [
  ["totalCount", "전체 협진", "default"],
  ["requestedCount", "요청", "warning"],
  ["acceptedCount", "수락", "green"],
  ["inProgressCount", "진행 중", "blue"],
  ["completedCount", "완료", "gray"],
  ["canceledCount", "취소", "red"],
];

function ConsultationStatusPage() {
  const [stats, setStats] = useState(null);
  const [scope, setScope] = useState("doctor");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const response =
        scope === "doctor"
          ? await getDoctorConsultationStatistics(currentUser.doctorId, params)
          : await getConsultationStatistics(params);
      setStats(response.data);
    } catch (err) {
      setError(extractErrorMessage(err, "협진 통계를 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [endDate, scope, startDate]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const total = stats?.totalCount || 0;

  return (
    <section className="dpart-page">
      <div className="dpart-page-head">
        <div>
          <h1>협진 현황</h1>
          <p>요청, 수락, 완료, 취소 상태를 실시간 집계로 확인합니다.</p>
        </div>
      </div>

      <div className="dpart-filter-band">
        <div className="dpart-segment">
          <button className={scope === "doctor" ? "active" : ""} onClick={() => setScope("doctor")}>
            내 현황
          </button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>
            전체
          </button>
        </div>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <span>~</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button
          type="button"
          className="dpart-secondary"
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
        >
          초기화
        </button>
        <button
          type="button"
          className="dpart-secondary"
          onClick={() => {
            setStartDate(todayString());
            setEndDate(todayString());
          }}
        >
          오늘
        </button>
      </div>

      {error && <div className="dpart-alert error">{error}</div>}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="dpart-stat-grid">
            {statusCards.map(([key, label, tone]) => (
              <StatCard key={key} label={label} value={stats?.[key]} tone={tone} />
            ))}
          </div>

          <div className="dpart-panel">
            <h2>상태 분포</h2>
            <div className="dpart-bars">
              {statusCards.slice(1).map(([key, label, tone]) => {
                const value = stats?.[key] || 0;
                const width = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div className="dpart-bar-row" key={key}>
                    <span>{label}</span>
                    <div className="dpart-bar-track">
                      <div className={`dpart-bar-fill tone-${tone}`} style={{ width: `${width}%` }} />
                    </div>
                    <strong>{width}%</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default ConsultationStatusPage;
