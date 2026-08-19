import dpartApi from "./dpartApi";

export const getConsultationStatistics = (params = {}) =>
  dpartApi.get("/api/statistics/consultations", { params });

export const getDoctorConsultationStatistics = (doctorId, params = {}) =>
  dpartApi.get(`/api/statistics/consultations/doctor/${doctorId}`, { params });
