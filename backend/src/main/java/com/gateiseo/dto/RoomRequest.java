package com.gateiseo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class RoomRequest {
    @NotBlank(message = "방 이름을 입력해주세요")
    @Size(max = 30, message = "방 이름은 30자 이하로 입력해주세요")
    private String title;

    private String memo;
}
