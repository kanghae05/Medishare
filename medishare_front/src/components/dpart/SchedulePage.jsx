import { useCallback, useEffect, useState } from "react";
import {
  createSchedule,
  deleteSchedule,
  getDoctorSchedules,
  getDoctorSchedulesByDate,
  getDoctorSchedulesByPeriod,
  updateSchedule,
} from "../../api/scheduleApi";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import ScheduleModal from "./ScheduleModal";
import StatusBadge from "./StatusBadge";
import { extractErrorMessage, getCurrentUser, todayString } from "./dpartUtils";

function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [date, setDate] = useState(todayString());
  const [startDate, setStartDate] = useState(todayString());
  const [endDate, setEndDate] = useState(todayString());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const user = getCurrentUser();

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (filterMode === "date") {
        response = await getDoctorSchedulesByDate(user.doctorId, date);
      } else if (filterMode === "period") {
        response = await getDoctorSchedulesByPeriod(user.doctorId, startDate, endDate);
      } else {
        response = await getDoctorSchedules(user.doctorId);
      }
      setSchedules(response.data || []);
    } catch (err) {
      setError(extractErrorMessage(err, "일정 목록을 불러오지 못했습니다."));
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [date, endDate, filterMode, startDate, user.doctorId]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const openCreate = () => {
    setEditingSchedule(null);
    setModalOpen(true);
  };

  const openEdit = (schedule) => {
    setEditingSchedule(schedule);
    setModalOpen(true);
  };

  const submitSchedule = async (payload) => {
    setSaving(true);
    setError("");
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.scheduleId, payload);
        setMessage("일정이 수정되었습니다.");
      } else {
        await createSchedule({ ...payload, doctorId: user.doctorId });
        setMessage("일정이 등록되었습니다.");
      }
      setModalOpen(false);
      await loadSchedules();
    } catch (err) {
      setError(extractErrorMessage(err, "일정을 저장하지 못했습니다."));
    } finally {
      setSaving(false);
    }
  };

  const removeSchedule = async (scheduleId) => {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) return;
    setError("");
    try {
      await deleteSchedule(scheduleId);
      setMessage("일정이 삭제되었습니다.");
      await loadSchedules();
    } catch (err) {
      setError(extractErrorMessage(err, "일정을 삭제하지 못했습니다."));
    }
  };

  const resetFilter = () => {
    setFilterMode("all");
    setDate(todayString());
    setStartDate(todayString());
    setEndDate(todayString());
  };

  return (
    <section className="dpart-page">
      <div className="dpart-page-head">
        <div>
          <h1>{user.isAdmin ? "의료진 일정" : "의사 일정"}</h1>
          <p>협진 가능한 시간과 일정을 등록하고 관리합니다.</p>
        </div>
        <button type="button" className="dpart-primary" onClick={openCreate}>
          + 일정 등록
        </button>
      </div>

      <div className="dpart-filter-band">
        <div className="dpart-segment">
          <button className={filterMode === "all" ? "active" : ""} onClick={() => setFilterMode("all")}>
            전체
          </button>
          <button className={filterMode === "date" ? "active" : ""} onClick={() => setFilterMode("date")}>
            날짜
          </button>
          <button className={filterMode === "period" ? "active" : ""} onClick={() => setFilterMode("period")}>
            기간
          </button>
        </div>
        {filterMode === "date" && (
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        )}
        {filterMode === "period" && (
          <>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <span>~</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </>
        )}
        <button type="button" className="dpart-secondary" onClick={resetFilter}>
          초기화
        </button>
      </div>

      {message && <div className="dpart-alert success">{message}</div>}
      {error && <div className="dpart-alert error">{error}</div>}

      {loading ? (
        <LoadingState />
      ) : schedules.length === 0 ? (
        <EmptyState message="등록된 일정이 없습니다." />
      ) : (
        <div className="dpart-table-wrap">
          <table className="dpart-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>시간</th>
                <th>상태</th>
                <th>메모</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.scheduleId}>
                  <td>{schedule.scheduleDate}</td>
                  <td>
                    {schedule.startTime?.slice(0, 5)} - {schedule.endTime?.slice(0, 5)}
                  </td>
                  <td>
                    <StatusBadge type={schedule.scheduleType} />
                  </td>
                  <td>{schedule.memo || "-"}</td>
                  <td>
                    <div className="dpart-row-actions">
                      <button type="button" onClick={() => openEdit(schedule)}>
                        수정
                      </button>
                      <button type="button" className="danger" onClick={() => removeSchedule(schedule.scheduleId)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ScheduleModal
        open={modalOpen}
        mode={editingSchedule ? "edit" : "create"}
        initialData={editingSchedule}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSubmit={submitSchedule}
      />
    </section>
  );
}

export default SchedulePage;
