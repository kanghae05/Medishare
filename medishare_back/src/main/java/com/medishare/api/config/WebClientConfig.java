package com.medishare.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    // Orthanc Pacs에 접속하기 위한 WebClient 객체 생성해서 저장해 놓는 메서드
    public WebClient orthancWebClient(){
        return WebClient.builder()
                .baseUrl("http://localhost:8042")
                .defaultHeaders(header -> {
                    header.setBasicAuth("admin", "1234");
                })
                .build();
    }

}
