package com.medishare.api.coop.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Orthanc(DICOM 서버) REST API를 대신 호출해주는 프록시.
 *
 * - 프론트는 Orthanc 서버에 직접 접근하지 않고, 항상 우리 백엔드(coop 도메인)를 거친다.
 * - Orthanc가 이미 DICOM -> PNG 변환(/instances/{id}/preview)을 대신 해주므로,
 *   여기서는 별도 DICOM 디코딩 라이브러리가 필요 없다.
 * - Orthanc 자체에 Basic Auth가 걸려있어서, 요청마다 Authorization 헤더를 실어 보낸다.
 *
 * application.properties에 추가해야 하는 설정:
 *   orthanc.base-url=http://<PACS 서버 IP>:8042
 *   orthanc.username=<Orthanc 계정>
 *   orthanc.password=<Orthanc 비밀번호>
 *
 * TODO: 지금은 RestTemplate을 직접 new 해서 쓰는 임시 구성이다. 실제로 자주 쓰게 되면
 *   타임아웃 설정이 있는 관리형 RestTemplate/RestClient 빈으로 교체하는 게 좋다.
 */
@Service
public class OrthancImageService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${orthanc.base-url:}")
    private String baseUrl;

    @Value("${orthanc.username:}")
    private String username;

    @Value("${orthanc.password:}")
    private String password;

    private void checkConfigured() {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException(
                    "orthanc.base-url이 설정되지 않았습니다. PACS 담당자에게 Orthanc 서버 주소를 확인해 application.properties에 추가하세요.");
        }
    }

    /** Orthanc 계정 정보가 설정돼 있으면 Basic Auth 헤더를 실어 보낸다. */
    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        if (username != null && !username.isBlank()) {
            headers.setBasicAuth(username, password == null ? "" : password);
        }
        return headers;
    }

    /**
     * 해당 시리즈(series)에 속한 이미지(instance) ID 목록을 순서대로 반환한다.
     * 검사(study) 하나에 시리즈가 여러 개일 수 있어서, 반드시 시리즈 단위로 가져와야
     * 서로 다른 시리즈의 이미지가 한 슬라이더에 섞이지 않는다.
     * (예전엔 GET /studies/{id}/instances로 검사 전체를 평탄화해서 가져왔는데,
     *  시리즈가 여러 개면 서로 다른 촬영이 순서 구분 없이 이어져 보이는 문제가 있었다.)
     */
    @SuppressWarnings("unchecked")
    public List<String> listInstanceIdsForSeries(String orthancSeriesId) {
        checkConfigured();

        String url = baseUrl + "/series/" + orthancSeriesId + "/instances";
        HttpEntity<Void> request = new HttpEntity<>(authHeaders());
        ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, request, List.class);

        List<Map<String, Object>> instances = response.getBody();
        if (instances == null) {
            return List.of();
        }
        return instances.stream()
                .map(instance -> (String) instance.get("ID"))
                .toList();
    }

    /** 이미지 한 장(instance)을 미리보기용 PNG 바이트로 가져온다. */
    public byte[] fetchPreview(String instanceId) {
        checkConfigured();

        String url = baseUrl + "/instances/" + instanceId + "/preview";
        HttpEntity<Void> request = new HttpEntity<>(authHeaders());
        ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, request, byte[].class);
        return response.getBody();
    }
}