package com.gateiseo.controller;

import com.gateiseo.common.ApiResponse;
import com.gateiseo.dto.AuthRequest;
import com.gateiseo.dto.AuthResponse;
import com.gateiseo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/kakao")
    public ResponseEntity<ApiResponse<AuthResponse>> kakaoLogin(
            @RequestBody AuthRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                authService.kakaoLogin(request.getCode(), request.getRedirectUri())
        ));
    }
}
