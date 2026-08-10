package com.medishare.api.config;

import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QeuryDSLConfiguration {

    //자동 DI + 추가 적인 처리 내용
    @PersistenceContext
    EntityManager entityManager;

    // 프로그램이 동작될 때에 객체를 생성해서 저장해 준다.
    @Bean
    public JPAQueryFactory jpaQueryFactory(){
        return new JPAQueryFactory(entityManager);
    }
}
