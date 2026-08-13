export const getStoredLogin = () => {
  try {
    return JSON.parse(localStorage.getItem("login")) || null;
  } catch {
    return null;
  }
};

export const getAuthToken = () => localStorage.getItem("token");

export const getRoles = (login = getStoredLogin()) => {
  if (Array.isArray(login?.roles)) return login.roles;
  if (login?.role) return [login.role];
  return [];
};

export const hasAnyRole = (login, targets) => {
  const normalizedTargets = targets.map((role) => role.replace(/^ROLE_/, ""));
  return getRoles(login).some((role) => normalizedTargets.includes(String(role).replace(/^ROLE_/, "")));
};

export const isAdminLogin = (login = getStoredLogin()) => hasAnyRole(login, ["ADMIN"]);

export const isDoctorLogin = (login = getStoredLogin()) => {
  if (!login || isAdminLogin(login)) return false;
  if (hasAnyRole(login, ["DOCTOR"])) return true;

  const subject = login?.sub || login?.id || "";
  if (/^doctor\d+$/i.test(String(subject))) return true;

  return hasAnyRole(login, ["USER"]);
};

const deriveDoctorId = (login) => {
  const explicitId = login?.doctorId || login?.doctor_id || login?.memberNo || login?.memberId || login?.no;
  if (explicitId && !Number.isNaN(Number(explicitId))) {
    return Number(explicitId);
  }

  const subject = login?.sub || login?.id || "";
  const match = String(subject).match(/^doctor(\d+)$/i);
  return match ? Number(match[1]) : null;
};

export const getCurrentUser = () => {
  const login = getStoredLogin();
  const roles = getRoles(login);
  const subject = login?.sub || login?.id || "";
  const isAdmin = isAdminLogin(login);
  const isDoctor = isDoctorLogin(login);
  const doctorId = deriveDoctorId(login);

  return {
    isAuthenticated: Boolean(getAuthToken() && login),
    memberId: login?.memberId || login?.memberNo || login?.no || doctorId || subject || null,
    doctorId,
    name: login?.name || subject || "사용자",
    department: login?.department || "진료과 미연동",
    role: isAdmin ? "ADMIN" : isDoctor ? "DOCTOR" : roles[0] || "USER",
    roles,
    isAdmin,
    isDoctor,
    isMock: !login?.doctorId && !login?.memberNo && !login?.no,
  };
};

export const canAccessDPart = () => {
  const user = getCurrentUser();
  return user.isAuthenticated;
};

export const canAccessConsultationManagement = () => {
  const user = getCurrentUser();
  return user.isAuthenticated && user.isDoctor;
};

export const canAccessDiseaseStatistics = () => {
  const user = getCurrentUser();
  return user.isAuthenticated;
};

export const currentUser = getCurrentUser();

export const scheduleTypeLabels = {
  AVAILABLE: "협진 가능",
  RESERVED: "협진 예정",
  UNAVAILABLE: "협진 불가",
};

export const extractErrorMessage = (error, fallback = "요청을 처리하지 못했습니다.") => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (data.message) return data.message;
  if (typeof data === "string") return data;
  return fallback;
};

export const todayString = () => new Date().toISOString().slice(0, 10);

export const toTimeWithSeconds = (value) => {
  if (!value) return "";
  return value.length === 5 ? `${value}:00` : value;
};

export const toTimeWithoutSeconds = (value) => {
  if (!value) return "";
  return value.slice(0, 5);
};
