import { useEffect, useState } from "react";
import { getDoctorSchedulesByDate } from "../../api/scheduleApi";
import { getDoctorConsultationStatistics } from "../../api/statisticsApi";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import StatCard from "./StatCard";
import StatusBadge from "./StatusBadge";
import { extractErrorMessage, getCurrentUser, todayString } from "./dpartUtils";

const emptyStats = {
  totalCount: 0,
  requestedCount: 0,
  acceptedCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  canceledCount: 0,
};

function DashboardPage() {
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState("");
  const [statsError, setStatsError] = useState("");
  const user = getCurrentUser();

  useEffect(() => {
    let ignore = false;
    const today = todayString();

    async function loadDashboard() {
      setLoading(true);
      setScheduleError("");
      setStatsError("");

      const [scheduleResult, statsResult] = await Promise.allSettled([
        getDoctorSchedulesByDate(user.doctorId, today),
        getDoctorConsultationStatistics(user.doctorId, { startDate: today, endDate: today }),
      ]);

      if (ignore) return;

      if (scheduleResult.status === "fulfilled") {
        setTodaySchedules(scheduleResult.value.data || []);
      } else {
        setTodaySchedules([]);
        setScheduleError(extractErrorMessage(scheduleResult.reason, "일정 정보를 불러오지 못했습니다."));
      }

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data || emptyStats);
      } else {
        setStats(emptyStats);
        setStatsError(extractErrorMessage(statsResult.reason, "협진 통계를 불러오지 못했습니다."));
      }

      setLoading(false);
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, [user.doctorId]);

  return (
    <section className="dpart-page">
      <div className="dpart-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>
            {user.name}님의 오늘 일정과 협진 현황입니다.
            {user.isMock && <span className="dpart-inline-note"> 인증 연동 대기: doctorId={user.doctorId}</span>}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="dpart-stat-grid">
            <StatCard label="오늘 일정" value={todaySchedules.length} tone="blue" />
            <StatCard label="협진 요청" value={stats.requestedCount} tone="warning" />
            <StatCard label="진행 중 협진" value={stats.inProgressCount} tone="green" />
            <StatCard label="완료 협진" value={stats.completedCount} tone="gray" />
          </div>

          {statsError && <div className="dpart-alert error">{statsError}</div>}

          <div className="dpart-panel">
            <h2>오늘의 일정</h2>
            {scheduleError ? (
              <div className="dpart-alert error">{scheduleError}</div>
            ) : todaySchedules.length === 0 ? (
              <EmptyState message="오늘 등록된 일정이 없습니다." />
            ) : (
              <div className="dpart-timeline">
                {todaySchedules.map((schedule) => (
                  <div className="dpart-timeline-item" key={schedule.scheduleId}>
                    <time>
                      {schedule.startTime?.slice(0, 5)} - {schedule.endTime?.slice(0, 5)}
                    </time>
                    <div>
                      <StatusBadge type={schedule.scheduleType} />
                      <p>{schedule.memo || "메모 없음"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;
