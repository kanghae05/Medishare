import axios from "axios";

// axios 객체로 기본 URL을 세팅하여 api 객체 생성 - 실제적인 통신을 담당
const api = axios.create({
    baseURL: "http://localhost"
});

// 비동기 통신을 요청하기 전에 자동으로 실행되는 처리문
api.interceptors.request.use(
    (config) => {

        // 저장되어 있는 토큰을 가져온다.
        const token = localStorage.getItem("token");

        // 토큰이 있으면 X-AUTH-TOKEN 헤더에 세팅
        if (token) {
            config.headers["X-AUTH-TOKEN"] = token;
        }

        return config;
    },
    // 통신 실패로 catch 처리로 이동
    (error) => Promise.reject(error)
);

// 비동기 통신을 요청한 후에 처리되는 처리문
api.interceptors.response.use(

    (response) => response,

    (error) => {

        // 인증 실패 시 실행되는 조건문 - 토큰 없음, 토큰 만료, 잘못된 토큰 등
        if (error.response?.status === 401) {

            localStorage.removeItem("token");

            window.location.href = "/member/login";
        }

        // 통신 실패로 catch 처리로 이동
        return Promise.reject(error);
    }

);

export default api;