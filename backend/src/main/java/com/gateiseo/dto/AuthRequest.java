package com.gateiseo.dto;

import lombok.Getter;

@Getter
public class AuthRequest {
    private String code;
    private String redirectUri;
}
