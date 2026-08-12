package com.medishare.api.config;

import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import com.medishare.api.member.service.PacsAccessLogInterceptor;

@Configuration
@Log4j2
public class WebConfig implements WebMvcConfigurer {

    private final PacsAccessLogInterceptor pacsAccessLogInterceptor;

    public WebConfig(PacsAccessLogInterceptor pacsAccessLogInterceptor) {
        this.pacsAccessLogInterceptor = pacsAccessLogInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(pacsAccessLogInterceptor).addPathPatterns("/pacs/list.do", "/pacs/view.do", "/pacs/thumbnail/**");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        log.info("[addResourceHandlers] image URI 폴더 추가 ------");

        // URI로 접근이 안되는 폴더를 접근이 가능한 URI와 매칭시켜서 접근시켜준다.
        registry.addResourceHandler("/upload/image/**")
                .addResourceLocations("file:///C:/upload/image/");
    }

}
