import api from "../components/common/api";

export const getConsultationStatistics = (params = {}) =>
  api.get("/api/statistics/consultations", { params });

export const getDoctorConsultationStatistics = (doctorId, params = {}) =>
  api.get(`/api/statistics/consultations/doctor/${doctorId}`, { params });

export const getDiseaseStatistics = (params = {}) =>
  api.get("/api/statistics/diseases", { params });

export const getTopDiseaseStatistics = (limit = 5) =>
  api.get("/api/statistics/diseases/top", { params: { limit } });
