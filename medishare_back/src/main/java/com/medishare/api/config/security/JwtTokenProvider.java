package com.medishare.api.config.security;

import com.medishare.api.member.entity.MemberDetails;
import com.medishare.api.member.service.MemberDetailsService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor // private final 변수 중 초기값을 세팅하지 않은 변수를 생성자로 DI 적용
@Log4j2
// JWT : JSON Web Token - 토큰 관리 프로그램.
public class JwtTokenProvider {

    private final MemberDetailsService memberDetailsService;

    // application.properties에 springboot.jwt.secret 항목으로 세팅되어 있는 값을 가져다 사용한다.
    // 아래 초기값을 덮어 쓰기를 한다.
    // ${springboot.jwt.secret:secretKey} - application.properties에 springboot.jwt.secret 세팅한다.
    // 세팅이 되어 있으면 properties의 값을 사용한다. 그렇지 않으면 초기값이 있으면 그대로 사용한다.
    @Value("${springboot.jwt.secret}")
    private  String secretKey;

    // secretKey를 이용해서 암호화된 Key를 만들어서 저장해 놓는다.- 한번만 하면된다. init()에서 처리
    private Key key;

    // token의 유효 시간을 세팅 - 1시간 : 1000L - 1초 * 60 - 분 * 60 - 시간
    private  final  long tokenValidMillisecond = 1000L * 60 * 60;



    // 생성자 실행 후 뒤에서 처리되는 메서드 선언
    @PostConstruct
    protected void  init(){
        log.info("[init] JwtTokenProvider 내 secretKey 이용 key 초기화 시작");

        // secretKey를 가지고 문자 배열로 만들어 key 생성한다.
//        secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes(StandardCharsets.UTF_8));
        key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        log.info("[init] JwtTokenProvider 내 secretKey 이용 key 초기화 초기화 완료");
    }

    // 토큰을 만드는 메서드 - 정상적인 로그인이 처리되고 (토근이 없으면) 실행
    public String createToken(String id, String name, Long memberNo, Long departmentNo, String department, List<String> roles){
        log.info("[createToken] 토큰 생성 시작");
        log.info("[createToken] 토큰에 저장할 데이터 : id, name, memberNo, department, roles");
        Claims claims = Jwts.claims().setSubject(id);
        claims.put("name",name);
        claims.put("memberNo", memberNo);
        claims.put("memberId", memberNo);
        claims.put("doctorId", memberNo);
        claims.put("departmentNo", departmentNo);
        claims.put("department", department);
        claims.put("roles",roles);
        Date now = new Date();

        // Key key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .setClaims(claims) // 사용자 정보
                .setIssuedAt(now) // 토큰 시작 시간 = 발급 시간
                // 토큰의 유효 시간 tokenValidMillisecond - 1000*60*60(1시간)
                .setExpiration(new Date(now.getTime() + tokenValidMillisecond))
//                .signWith(SignatureAlgorithm.HS256, secretKey) // 전자 서명 - 256 비트(=32바이트)
                .signWith(key, SignatureAlgorithm.HS256) // 전자 서명 - 256 비트(=32바이트)
                .compact(); // 토큰 정보를 문자열로 만든다.

        log.info("[createToken] 토큰 생성 완료");
        return token;
    }

    // 토큰에서 사용자 아이디를 꺼내는 메서드 - 토큰을 가지고 들어온 경우의 처리
    public String getId(String token){
        log.info("[getId] 토큰 기반 회원 구별 정보 추출 시작");

        String info = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
        log.info("[getId] 토큰 기반 회원 구별 정보 추출 완료, id : {}", info);

        return info;
    }

    // 사용자 인증 정보를 반환하는 메서드
    public Authentication getAuthentication(String token) {
        log.info("[getAuthentication] 토큰 인증 정보 조회 시작");
        MemberDetails memberDetails = memberDetailsService.loadMemberById(this.getId(token));
        log.info("[getAuthentication] 토큰 인증 정보 조회 완료. MemberDetails.id : {}",
                memberDetails.getId());
        // 두번째 파라메터의 "" 는 인증에 대한 처리 -> 로그인 처리가 되어 있고 토큰도 검증 완료가 된 상태
        return new UsernamePasswordAuthenticationToken
                (memberDetails, "", memberDetails.getAuthorities());
    }

    // 클라이언트 -> 서버로 정보가 전달되는데 이때 request 객체가 받는다. 헤더가 포함되어 있다.
    // 토큰을 헤더에 담아서 전달한다.
    public String resolveToken(HttpServletRequest request){
        log.info("[resolveToken] Http 헤더에서 Token 값을 추출");
        return request.getHeader("X-AUTH-TOKEN");
    }

    // 토큰이 유효한지 체크하는 메서드
    public  boolean validateToken(String token){
        log.info("[validateToken] 토큰 유효 체크 시작");
        try {
//            Jws<Claims> claims = Jwts.parser().setSigningKey(secretKey)
//                    .parseClaimsJws(token);
            Jws<Claims> claims = Jwts.parserBuilder().setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            // ! 붙여서 : true - 유효한 토큰, false - 만료된 토큰
            // .before(new Date()) 만료 날짜가 현재 날짜 이전에 있다.
//            return !claims.getBody().getExpiration().before(new Date());
            return true;
        } catch (Exception e){
            log.error("[validateToken] 토큰 유효 체크 예외 발생 - 위조나 변조");
            return false;
        }
    }
}
