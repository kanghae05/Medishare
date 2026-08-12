package com.medishare.api.config.security;

import org.apache.catalina.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfiguration {

    private final JwtTokenProvider jwtTokenProvider;

    // 생성자를 이용한 세팅
    @Autowired
    public SecurityConfiguration(JwtTokenProvider jwtTokenProvider){
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean // 리턴되는 객체(SecurityFilterChain)를 등록해서 사용한다.
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception{
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable) //CSRF 보호 기능을 끄는 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(
                        httpSecuritySessionManagementConfigurer ->
                                httpSecuritySessionManagementConfigurer.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS)) // session을 사용하지 않는다.
                //사용자 이름(username)과 비밀번호(password)를 HTTP 헤더에 담아 보내는 가장 기본적인 인증 방식 사용안함.
                // JWT으로 사용한다.
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize ->
                        authorize
                            // 인증(Authentication) 없이 모든 사용자의 접근을 허용 - permitAll()
                            // OPTIONS 요청 - 실제적인 get, post, push, delete 전송을 하기 전에
                            //       사전에 통신이 가능한지 점검하는 요청을 보통 전부 허용한다.
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                            .requestMatchers("/swagger",
                                    "/swagger-ui.html", "/swagger-ui/**", "/api-docs",
                                    "/api-docs/**", "/v3/api-docs/**" ).permitAll()
                            .requestMatchers(HttpMethod.GET, "/product/**").permitAll()
                            .requestMatchers("/member/login.do", "/member/write.do").permitAll()
                            .requestMatchers(HttpMethod.GET, "/product/**").permitAll()
                            .requestMatchers("/board/**", "/image/list.do", "/image/view.do").permitAll()
                            .requestMatchers("/image/write.do", "/image/update.do", "/image/delete.do").hasRole("USER")
                            .requestMatchers("/report/**").hasAnyRole("USER", "ADMIN")
                            .requestMatchers("/pacs/**").permitAll()
                            .requestMatchers("/coop/**").permitAll()
                            .requestMatchers("/upload/**").permitAll()
                            .requestMatchers("/txt/**").permitAll()
                            .requestMatchers("**exception**").permitAll()
                            // 앞에서 정의한 URL을 제외한 모든 요청은 ADMIN 역할(Role)을 가진 사용자만
                            // 접근할 수 있도록 하는 인가(Authorization) 규칙
                            // 접근하는 사용자의 권한이 ADMIN인지 알기 위해서 토큰은 확인한다.
                            .anyRequest().hasRole("ADMIN")
                )
                // 스프링 시큐리티에서 기본으로 제공하고 있는 로그임 폼을 비활성화한다.
                .formLogin(AbstractHttpConfigurer::disable)
                // 토큰 처리를 앞에 다음 사용자 로그인(아이디, 비밀번호 확인 필터)
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling((exceptionHanling) ->
                        exceptionHanling
                                .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                                .accessDeniedHandler(new CustomAccessDeniedHandler()));

        return httpSecurity.build();

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("*"));

        configuration.setAllowedMethods(
                List.of("GET","POST","PUT","DELETE","OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

}
