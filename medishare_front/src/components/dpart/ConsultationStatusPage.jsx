import { useCallback, useEffect, useState } from "react";
import { getDoctorConsultationStatistics } from "../../api/statisticsApi";
import EmptyState from "./EmptyState";
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

const statusRows = statusCards.slice(1);

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
  const periodLabel = startDate || endDate
    ? `${startDate || "전체"} ~ ${endDate || "전체"}`
    : "전체 기간";

  return (
    <section className="dpart-page dpart-work-page consultation-status-page">
      <div className="dpart-page-head consultation-status-head">
        <div>
          <span className="dpart-eyebrow">MEDISHARE · CONSULTATION</span>
          <h1>협진 현황</h1>
          <p>현재 참여 중인 협진 요청과 진행 상태를 확인할 수 있습니다.</p>
        </div>

        <div className="consultation-filter-box" aria-label="협진 현황 기간 필터">
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <span>~</span>
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <button type="button" className="dpart-secondary" onClick={resetDates}>초기화</button>
          <button type="button" className="dpart-secondary" onClick={setToday}>오늘</button>
        </div>
      </div>

      {loading ? (
        <div className="dpart-state">협진 정보를 불러오는 중입니다.</div>
      ) : error ? (
        <div className="dpart-alert error">{error}</div>
      ) : (
        <>
          <div className="consultation-summary-strip" aria-label="협진 상태 요약">
            {statusCards.map(([key, label, tone]) => (
              <div className={`consultation-summary-item tone-${tone}`} key={key}>
                <span>{label}</span>
                <strong>{Number(stats[key] || 0).toLocaleString()}</strong>
              </div>
            ))}
          </div>

          <div className="dpart-panel dpart-work-panel consultation-list-panel">
            <div className="dpart-section-head consultation-list-head">
              <div>
                <h2>전체 협진 이력</h2>
                <p>{periodLabel} 기준 상태별 협진 현황입니다.</p>
              </div>
            </div>

            {total === 0 ? (
              <EmptyState message="등록된 협진 이력이 없습니다." />
            ) : (
              <div className="consultation-status-table" role="table" aria-label="협진 상태 목록">
                <div className="consultation-status-table-head" role="row">
                  <span>NO</span>
                  <span>협진 내용</span>
                  <span>상태</span>
                  <span>현황</span>
                </div>

                {statusRows.map(([key, label, tone], index) => {
                  const value = stats[key] || 0;
                  const width = total > 0 ? Math.round((value / total) * 100) : 0;
                  return (
                    <div className="consultation-status-table-row" role="row" key={key}>
                      <span className="consultation-row-no">{String(index + 1).padStart(2, "0")}</span>
                      <div className="consultation-row-main">
                        <strong>{label} 상태 협진</strong>
                        <span>현재 조건에서 {value.toLocaleString()}건이 집계되었습니다.</span>
                      </div>
                      <span className={`consultation-status-badge tone-${tone}`}>{label}</span>
                      <div className="consultation-row-meta">
                        <strong>{width}%</strong>
                        <span>{value.toLocaleString()}건</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default ConsultationStatusPage;
