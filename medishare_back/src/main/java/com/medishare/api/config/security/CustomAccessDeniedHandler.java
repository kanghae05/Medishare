package com.medishare.api.config.security;

import com.medishare.api.member.service.PacsAccessLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Log4j2
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    private final PacsAccessLogService pacsAccessLogService;

    public CustomAccessDeniedHandler(PacsAccessLogService pacsAccessLogService) {
        this.pacsAccessLogService = pacsAccessLogService;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        if (isAuditedPacsReadRequest(request.getRequestURI())) {
            try {
                String studyId = request.getParameter("id");
                if (request.getRequestURI().startsWith("/pacs/thumbnail/")) studyId = request.getRequestURI().substring(request.getRequestURI().lastIndexOf('/') + 1);
                pacsAccessLogService.record(SecurityContextHolder.getContext().getAuthentication(), request,
                        request.getRequestURI().equals("/pacs/list.do") ? "STUDY" : "IMAGE",
                        request.getRequestURI().equals("/pacs/list.do") ? "SEARCH" : "VIEW", "DENIED", studyId);
            } catch (RuntimeException e) {
                log.error("Unable to save denied PACS access log.", e);
            }
        }
        // sendError() triggers an /error dispatch. That dispatch is protected by the
        // catch-all rule and can turn an authenticated user's 403 into a 401.
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
        response.getWriter().write("{\"message\":\"Access denied.\"}");
    }

    private boolean isAuditedPacsReadRequest(String uri) {
        return "/pacs/list.do".equals(uri) || "/pacs/view.do".equals(uri) || uri.startsWith("/pacs/thumbnail/");
    }
}
