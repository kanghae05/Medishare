import dpartApi from "./dpartApi";

export const createSchedule = (payload) => dpartApi.post("/api/schedules", payload);

export const getSchedule = (scheduleId) => dpartApi.get(`/api/schedules/${scheduleId}`);

export const getDoctorSchedules = (doctorId) => dpartApi.get(`/api/schedules/doctor/${doctorId}`);

export const getDoctorSchedulesByDate = (doctorId, date) =>
  dpartApi.get(`/api/schedules/doctor/${doctorId}`, { params: { date } });

export const getDoctorSchedulesByPeriod = (doctorId, startDate, endDate) =>
  dpartApi.get(`/api/schedules/doctor/${doctorId}`, { params: { startDate, endDate } });

export const updateSchedule = (scheduleId, payload) =>
  dpartApi.put(`/api/schedules/${scheduleId}`, payload);

export const deleteSchedule = (scheduleId) => dpartApi.delete(`/api/schedules/${scheduleId}`);
