package com.medishare.api.member.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class PacsAccessLogInterceptor implements HandlerInterceptor {
    private final PacsAccessLogService accessLogService;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception exception) {
        String uri = request.getRequestURI();
        if (exception instanceof AccessDeniedException) return;
        String studyId = request.getParameter("id");
        if (uri.startsWith("/pacs/thumbnail/")) studyId = uri.substring(uri.lastIndexOf('/') + 1);
        try {
            if (uri.equals("/pacs/list.do")) {
                accessLogService.record(SecurityContextHolder.getContext().getAuthentication(), request, "STUDY", "SEARCH", exception == null && response.getStatus() < 400 ? "SUCCESS" : "FAILURE", null);
            } else if (uri.equals("/pacs/view.do") || uri.startsWith("/pacs/thumbnail/")) {
                accessLogService.record(SecurityContextHolder.getContext().getAuthentication(), request, "IMAGE", "VIEW", exception == null && response.getStatus() < 400 ? "SUCCESS" : "FAILURE", studyId);
            }
        } catch (RuntimeException ignored) { }
    }
}
