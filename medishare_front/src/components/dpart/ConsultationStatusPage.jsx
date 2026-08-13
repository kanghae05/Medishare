import { useCallback, useEffect, useState } from "react";
import { getDoctorConsultationStatistics } from "../../api/statisticsApi";
import LoadingState from "./LoadingState";
import StatCard from "./StatCard";
import { extractErrorMessage, getCurrentUser, todayString } from "./dpartUtils";

const emptyStats = {
  totalCount: 0,
  requestedCount: 0,
  acceptedCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  canceledCount: 0,
};

const statusCards = [
  ["totalCount", "전체 협진", "default"],
  ["requestedCount", "요청", "warning"],
  ["acceptedCount", "수락", "green"],
  ["inProgressCount", "진행 중", "blue"],
  ["completedCount", "완료", "gray"],
  ["canceledCount", "취소", "red"],
];

function ConsultationStatusPage() {
  const [stats, setStats] = useState(emptyStats);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = getCurrentUser();

  const loadStats = useCallback(async () => {
    if (!user.doctorId) {
      setStats(emptyStats);
      setError("로그인한 의료진 ID를 확인할 수 없습니다.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const response = await getDoctorConsultationStatistics(user.doctorId, params);
      setStats(response.data || emptyStats);
    } catch (err) {
      setStats(emptyStats);
      setError(extractErrorMessage(err, "협진 정보를 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate, user.doctorId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const resetDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const setToday = () => {
    const today = todayString();
    setStartDate(today);
    setEndDate(today);
  };

  const total = stats.totalCount || 0;

  return (
    <section className="dpart-page dpart-work-page">
      <div className="dpart-page-head">
        <div>
          <h1>협진 현황</h1>
          <p>요청부터 완료까지 협진 상태를 기간별로 확인합니다.</p>
        </div>
      </div>

      <div className="dpart-filter-band compact">
        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <span>~</span>
        <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        <button type="button" className="dpart-secondary" onClick={resetDates}>초기화</button>
        <button type="button" className="dpart-secondary" onClick={setToday}>오늘</button>
      </div>

      {error && <div className="dpart-alert error">{error}</div>}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="dpart-stat-grid wide">
            {statusCards.map(([key, label, tone]) => (
              <StatCard key={key} label={label} value={stats[key]} tone={tone} />
            ))}
          </div>

          <div className="dpart-panel dpart-work-panel">
            <div className="dpart-section-head">
              <div>
                <h2>상태 분포</h2>
                <p>전체 협진 대비 상태별 비율입니다.</p>
              </div>
            </div>
            <div className="dpart-status-list">
              {statusCards.slice(1).map(([key, label, tone]) => {
                const value = stats[key] || 0;
                const width = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div className="dpart-status-row" key={key}>
                    <div>
                      <strong>{label}</strong>
                      <span>{value.toLocaleString()}건</span>
                    </div>
                    <div className="dpart-bar-track">
                      <div className={`dpart-bar-fill tone-${tone}`} style={{ width: `${width}%` }} />
                    </div>
                    <b>{width}%</b>
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
