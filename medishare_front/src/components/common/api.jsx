import axios from "axios";

// 현재 사이트를 연 PC가 아니라,
// 사이트가 실행 중인 서버의 hostname을 그대로 사용한다.
// 예:
// - 내 PC에서 접속: http://localhost
// - 발표 PC에서 내 노트북 IP로 접속: http://10.x.x.x
const api = axios.create({
  baseURL: `http://${window.location.hostname}`
});

// 비동기 통신 요청 전에 자동 실행
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["X-AUTH-TOKEN"] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 비동기 통신 응답 후 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 필요 시 401 처리
    // if (error.response?.status === 401) {
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("login");
    //   window.location.href = "/member/login";
    // }

    return Promise.reject(error);
  }
);

export default api;
