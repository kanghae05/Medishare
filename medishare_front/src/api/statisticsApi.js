import dpartApi from "./dpartApi";

export const getConsultationStatistics = (params = {}) =>
  dpartApi.get("/api/statistics/consultations", { params });

export const getDoctorConsultationStatistics = (doctorId, params = {}) =>
  dpartApi.get(`/api/statistics/consultations/doctor/${doctorId}`, { params });

export const getDiseaseStatistics = (params = {}) =>
  dpartApi.get("/api/statistics/diseases", { params });

export const getTopDiseaseStatistics = (limit = 5) =>
  dpartApi.get("/api/statistics/diseases/top", { params: { limit } });
