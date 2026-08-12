package com.gateiseo.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.UUID;

@Getter @Builder
public class AuthResponse {
    private String accessToken;
    private UserInfo user;

    @Getter @Builder
    public static class UserInfo {
        private UUID id;
        private String nickname;
        private String profileImage;
    }
}
