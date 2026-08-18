// 로그인 토큰(JWT)의 payload를 디코딩해서 roles를 읽는다.
// JwtTokenProvider.createToken()이 토큰 안에 "roles" claim을 이미 담아서 발급하므로,
// 백엔드에 별도로 물어볼 필요 없이 프론트에서 바로 판단할 수 있다.
function decodeTokenClaims() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((ch) => "%" + ch.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isAdmin() {
  const claims = decodeTokenClaims();
  return !!claims?.roles?.includes("ROLE_ADMIN");
}