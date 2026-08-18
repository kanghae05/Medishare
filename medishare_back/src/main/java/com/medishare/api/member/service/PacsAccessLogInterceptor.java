package com.medishare.api.member.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Log4j2
public class PacsAccessLogInterceptor implements HandlerInterceptor {

    private final PacsAccessLogService accessLogService;

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception exception
    ) {

        String uri = request.getRequestURI();

        if (!isPacsAccessTarget(uri)) {
            return;
        }

        try {
            String studyId = extractStudyId(request, uri);

            String dataType = resolveDataType(uri);
            String actionType = resolveActionType(uri);
            String accessResult = resolveAccessResult(response, exception);

            accessLogService.record(
                    SecurityContextHolder.getContext().getAuthentication(),
                    request,
                    dataType,
                    actionType,
                    accessResult,
                    studyId
            );

        } catch (Exception e) {
            /*
             * 접근 로그 기록 실패 때문에
             * 실제 PACS 조회 요청 자체가 실패하면 안 된다.
             *
             * 다만 기존처럼 완전히 무시하지 않고
             * 서버 로그에는 남긴다.
             */
            log.error(
                    "[PacsAccessLog] 접근 로그 기록 중 오류 발생. uri={}, status={}",
                    uri,
                    response.getStatus(),
                    e
            );
        }
    }

    /**
     * 현재 접근 로그를 기록할 PACS API인지 확인
     */
    private boolean isPacsAccessTarget(String uri) {
        return uri.equals("/pacs/list.do")
                || uri.equals("/pacs/view.do")
                || uri.startsWith("/pacs/thumbnail/");
    }

    /**
     * 접근 대상 Study ID 추출
     *
     * /pacs/list.do
     * → null
     *
     * /pacs/view.do?id=orthanc-s001
     * → orthanc-s001
     *
     * /pacs/thumbnail/orthanc-s001
     * → orthanc-s001
     */
    private String extractStudyId(
            HttpServletRequest request,
            String uri
    ) {
        if (uri.equals("/pacs/list.do")) {
            return null;
        }

        if (uri.equals("/pacs/view.do")) {
            return request.getParameter("id");
        }

        if (uri.startsWith("/pacs/thumbnail/")) {
            return uri.substring(uri.lastIndexOf('/') + 1);
        }

        return null;
    }

    /**
     * URL에 따른 의료 데이터 유형
     */
    private String resolveDataType(String uri) {

        if (uri.equals("/pacs/list.do")) {
            return "STUDY";
        }

        if (uri.equals("/pacs/view.do")) {
            return "STUDY";
        }

        if (uri.startsWith("/pacs/thumbnail/")) {
            return "IMAGE";
        }

        return "UNKNOWN";
    }

    /**
     * 현재 API의 행위
     */
    private String resolveActionType(String uri) {

        if (uri.equals("/pacs/list.do")
                || uri.equals("/pacs/view.do")
                || uri.startsWith("/pacs/thumbnail/")) {

            return "VIEW";
        }

        return "UNKNOWN";
    }

    /**
     * HTTP 결과를 접근 성공/거부로 변환
     *
     * 2xx / 3xx → SUCCESS
     * 4xx / 5xx → DENIED 또는 FAILED
     *
     * 현재 DB access_result를 SUCCESS / DENIED 중심으로 사용하고 있으므로
     * 4xx는 DENIED, 나머지 5xx는 DENIED로 통일한다.
     */
    private String resolveAccessResult(
            HttpServletResponse response,
            Exception exception
    ) {

        int status = response.getStatus();

        if (exception != null) {
            return "DENIED";
        }

        if (status >= 200 && status < 400) {
            return "SUCCESS";
        }

        return "DENIED";
    }
}