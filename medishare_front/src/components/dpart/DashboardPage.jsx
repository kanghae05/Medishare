import { useEffect, useState } from "react";
import { getDoctorSchedulesByDate } from "../../api/scheduleApi";
import { getDoctorConsultationStatistics } from "../../api/statisticsApi";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import StatCard from "./StatCard";
import StatusBadge from "./StatusBadge";
import { currentUser, extractErrorMessage, todayString } from "./dpartUtils";

function DashboardPage() {
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    const today = todayString();

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [scheduleResponse, statsResponse] = await Promise.all([
          getDoctorSchedulesByDate(currentUser.doctorId, today),
          getDoctorConsultationStatistics(currentUser.doctorId, { startDate: today, endDate: today }),
        ]);
        if (!ignore) {
          setTodaySchedules(scheduleResponse.data || []);
          setStats(statsResponse.data);
        }
      } catch (err) {
        if (!ignore) setError(extractErrorMessage(err, "대시보드 데이터를 불러오지 못했습니다."));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="dpart-page">
      <div className="dpart-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>{currentUser.name}님의 오늘 일정과 협진 현황입니다.</p>
        </div>
      </div>

      {error && <div className="dpart-alert error">{error}</div>}
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="dpart-stat-grid">
            <StatCard label="오늘 일정" value={todaySchedules.length} tone="blue" />
            <StatCard label="협진 요청" value={stats?.requestedCount} tone="warning" />
            <StatCard label="진행 중 협진" value={stats?.inProgressCount} tone="green" />
            <StatCard label="완료 협진" value={stats?.completedCount} tone="gray" />
          </div>

          <div className="dpart-panel">
            <h2>오늘의 일정</h2>
            {todaySchedules.length === 0 ? (
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
