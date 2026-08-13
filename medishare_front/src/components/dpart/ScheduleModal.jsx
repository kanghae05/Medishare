import { useEffect, useState } from "react";
import {
  scheduleTypeLabels,
  toTimeWithSeconds,
  toTimeWithoutSeconds,
  todayString,
} from "./dpartUtils";

const emptyForm = {
  scheduleDate: todayString(),
  startTime: "09:00",
  endTime: "11:00",
  scheduleType: "AVAILABLE",
  memo: "",
};

function ScheduleModal({ open, mode, initialData, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        scheduleDate: initialData.scheduleDate || todayString(),
        startTime: toTimeWithoutSeconds(initialData.startTime) || "09:00",
        endTime: toTimeWithoutSeconds(initialData.endTime) || "11:00",
        scheduleType: initialData.scheduleType || "AVAILABLE",
        memo: initialData.memo || "",
      });
      return;
    }

    setForm(emptyForm);
  }, [open, initialData]);

  if (!open) return null;

  const change = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      startTime: toTimeWithSeconds(form.startTime),
      endTime: toTimeWithSeconds(form.endTime),
    });
  };

  return (
    <div className="dpart-modal-backdrop" role="presentation">
      <div className="dpart-modal" role="dialog" aria-modal="true">
        <div className="dpart-modal-head">
          <h3>{mode === "edit" ? "일정 수정" : "일정 등록"}</h3>
          <button
            type="button"
            className="dpart-icon-button"
            onClick={onClose}
            aria-label="닫기"
          >
            x
          </button>
        </div>

        <form className="dpart-form" onSubmit={submit}>
          <label>
            <span>날짜</span>
            <input
              type="date"
              name="scheduleDate"
              value={form.scheduleDate}
              onChange={change}
              required
            />
          </label>

          <div className="dpart-form-grid">
            <label>
              <span>시작 시간</span>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={change}
                required
              />
            </label>
            <label>
              <span>종료 시간</span>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={change}
                required
              />
            </label>
          </div>

          <label>
            <span>일정 상태</span>
            <select
              name="scheduleType"
              value={form.scheduleType}
              onChange={change}
              required
            >
              {Object.entries(scheduleTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>메모</span>
            <textarea name="memo" rows="4" value={form.memo} onChange={change} />
          </label>

          <div className="dpart-modal-actions">
            <button type="button" className="dpart-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="dpart-primary" disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleModal;
