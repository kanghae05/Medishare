export const getStoredLogin = () => {
  try {
    return JSON.parse(localStorage.getItem("login")) || null;
  } catch {
    return null;
  }
};

export const getAuthToken = () => localStorage.getItem("token");

const deriveDoctorId = (login) => {
  const explicitId = login?.doctorId || login?.doctor_id || login?.memberNo || login?.memberId || login?.no;
  if (explicitId && !Number.isNaN(Number(explicitId))) {
    return Number(explicitId);
  }

  const subject = login?.sub || login?.id || "";
  const match = String(subject).match(/^doctor(\d+)$/i);
  return match ? Number(match[1]) : 1;
};

export const getCurrentUser = () => {
  const login = getStoredLogin();
  const roles = Array.isArray(login?.roles) ? login.roles : [];
  const isAdmin = roles.some((role) => role === "ADMIN" || role === "ROLE_ADMIN");
  const subject = login?.sub || login?.id || "";
  const isDoctorAccount = /^doctor\d+$/i.test(String(subject));

  return {
    isAuthenticated: Boolean(getAuthToken() && login),
    memberId: login?.memberId || login?.memberNo || login?.no || subject || null,
    doctorId: deriveDoctorId(login),
    name: login?.name || subject || "사용자",
    department: login?.department || "진료과 미연동",
    role: isAdmin ? "ADMIN" : "DOCTOR",
    roles,
    isAdmin,
    isDoctor: isDoctorAccount || !isAdmin,
    isMock: !login?.doctorId && !login?.memberNo && !login?.no,
  };
};

export const canAccessDPart = () => {
  const user = getCurrentUser();
  return user.isAuthenticated && (user.isAdmin || user.isDoctor);
};

export const currentUser = getCurrentUser();
export const scheduleTypeLabels = {
  AVAILABLE: "진료 가능",
  RESERVED: "진료 예정",
  UNAVAILABLE: "진료 불가",
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
