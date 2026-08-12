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
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied.");
    }

    private boolean isAuditedPacsReadRequest(String uri) {
        return "/pacs/list.do".equals(uri) || "/pacs/view.do".equals(uri) || uri.startsWith("/pacs/thumbnail/");
    }
}
