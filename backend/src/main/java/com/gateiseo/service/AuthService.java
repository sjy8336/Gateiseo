package com.gateiseo.service;

import com.gateiseo.domain.User;
import com.gateiseo.dto.AuthResponse;
import com.gateiseo.repository.UserRepository;
import com.gateiseo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final WebClient.Builder webClientBuilder;

    @Value("${kakao.api-url:https://kapi.kakao.com}")
    private String kakaoApiUrl;

    @Transactional
    public AuthResponse kakaoLogin(String code, String redirectUri) {
        String kakaoToken = fetchKakaoToken(code, redirectUri);

        // 카카오 API로 유저 정보 조회
        Map<String, Object> kakaoUser = fetchKakaoUserInfo(kakaoToken);

        String kakaoId = String.valueOf(kakaoUser.get("id"));
        Map<String, Object> profile = (Map<String, Object>)
                ((Map<String, Object>) kakaoUser.get("kakao_account")).get("profile");
        String nickname = (String) profile.get("nickname");
        String profileImage = (String) profile.getOrDefault("profile_image_url", null);

        // 기존 유저 조회 또는 신규 생성
        User user = userRepository.findByKakaoId(kakaoId)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .kakaoId(kakaoId)
                                .nickname(nickname)
                                .profileImage(profileImage)
                                .build()
                ));

        String token = jwtUtil.generateToken(user.getId());

        return AuthResponse.builder()
                .accessToken(token)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .nickname(user.getNickname())
                        .profileImage(user.getProfileImage())
                        .build())
                .build();
    }

    @Value("${kakao.client-id}")
    private String kakaoClientId;

    @Value("${kakao.client-secret}")
    private String kakaoClientSecret;

    @Value("${kakao.auth-url:https://kauth.kakao.com}")
    private String kakaoAuthUrl;

    private String fetchKakaoToken(String code, String redirectUri) {
        if (kakaoClientId == null || kakaoClientId.isBlank()) {
            throw new IllegalStateException("KAKAO_CLIENT_ID가 설정되지 않았습니다.");
        }

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", kakaoClientId);
        formData.add("redirect_uri", redirectUri);
        formData.add("code", code);
        if (kakaoClientSecret != null && !kakaoClientSecret.isBlank()) {
            formData.add("client_secret", kakaoClientSecret);
        }

        Map<String, Object> tokenResponse;
        try {
            tokenResponse = webClientBuilder.build()
                    .post()
                    .uri(kakaoAuthUrl + "/oauth/token")
                    .header("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (WebClientResponseException e) {
            throw new IllegalStateException(
                    "카카오 토큰 발급 실패: " + e.getResponseBodyAsString(),
                    e
            );
        }

        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            throw new IllegalStateException("카카오 액세스 토큰을 발급받지 못했습니다.");
        }

        return String.valueOf(tokenResponse.get("access_token"));
    }

    private Map<String, Object> fetchKakaoUserInfo(String kakaoToken) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(kakaoApiUrl + "/v2/user/me")
                    .header("Authorization", "Bearer " + kakaoToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (WebClientResponseException e) {
            throw new IllegalStateException(
                    "카카오 사용자 정보 조회 실패: " + e.getResponseBodyAsString(),
                    e
            );
        }
    }
}
