package com.medishare.api.specialcase.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** 판독소견에 포함된 환자 개인정보를 비식별화하는 유틸리티. */
public final class DeidentificationUtil {

    private static final String MASK = "******";

    // 주민등록번호 예: 900101-1234567, 9001011234567
    private static final Pattern RESIDENT_NUMBER_PATTERN =
            Pattern.compile("(?<!\\d)\\d{6}[- ]?[1-4]\\d{6}(?!\\d)");

    // 휴대전화와 지역번호를 포함한 일반적인 국내 전화번호 형식
    private static final Pattern PHONE_NUMBER_PATTERN =
            Pattern.compile("(?<!\\d)(?:01[016789]|0[2-6][1-5]?)[- .]?\\d{3,4}[- .]?\\d{4}(?!\\d)");

    private DeidentificationUtil() {
    }

    /** 본문에서 주민등록번호와 전화번호를 찾아 별표로 치환한다. */
    public static String scrub(String text) {
        if (text == null) {
            return null;
        }

        String withoutResidentNumber = RESIDENT_NUMBER_PATTERN.matcher(text).replaceAll(MASK);
        return PHONE_NUMBER_PATTERN.matcher(withoutResidentNumber).replaceAll(MASK);
    }

    /** 기본 개인정보 치환 후 본문에 포함된 환자 이름도 마스킹한다. */
    public static String scrub(String text, String patientName) {
        String safeText = scrub(text);

        if (safeText == null || patientName == null || patientName.isBlank()) {
            return safeText;
        }

        Pattern patientNamePattern = Pattern.compile(Pattern.quote(patientName.trim()));
        return patientNamePattern.matcher(safeText)
                .replaceAll(Matcher.quoteReplacement(maskName(patientName)));
    }

    /** 이름을 홍*동 형태로 마스킹한다. */
    public static String maskName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }

        String trimmedName = name.trim();

        if (trimmedName.length() == 1) {
            return "*";
        }
        if (trimmedName.length() == 2) {
            return trimmedName.charAt(0) + "*";
        }

        return trimmedName.charAt(0) + "*" + trimmedName.substring(2);
    }

    /** 원본 환자 ID를 복원할 수 없도록 SHA-256 해시 문자열로 변환한다. */
    public static String hashPatientId(String patientId) {
        if (patientId == null || patientId.isBlank()) {
            return null;
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(patientId.trim().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 algorithm is unavailable", exception);
        }
    }
}
