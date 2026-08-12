import api from "../components/common/api";

export const createSchedule = (payload) => api.post("/api/schedules", payload);

export const getSchedule = (scheduleId) => api.get(`/api/schedules/${scheduleId}`);

export const getDoctorSchedules = (doctorId) => api.get(`/api/schedules/doctor/${doctorId}`);

export const getDoctorSchedulesByDate = (doctorId, date) =>
  api.get(`/api/schedules/doctor/${doctorId}`, { params: { date } });

export const getDoctorSchedulesByPeriod = (doctorId, startDate, endDate) =>
  api.get(`/api/schedules/doctor/${doctorId}`, { params: { startDate, endDate } });

export const updateSchedule = (scheduleId, payload) =>
  api.put(`/api/schedules/${scheduleId}`, payload);

export const deleteSchedule = (scheduleId) => api.delete(`/api/schedules/${scheduleId}`);
