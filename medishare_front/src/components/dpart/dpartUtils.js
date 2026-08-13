export const currentUser = {
  memberId: 1,
  doctorId: 1,
  name: "김의사",
  department: "영상의학과",
  role: "DOCTOR",
};

export const getStoredLogin = () => {
  try {
    return JSON.parse(localStorage.getItem("login")) ?? null;
  } catch {
    return null;
  }
};

export const canAccessDPart = () => {
  const login = getStoredLogin();
  return Array.isArray(login?.roles) && login.roles.some((role) => role === "ROLE_USER" || role === "ROLE_ADMIN" || role === "ADMIN");
};

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
