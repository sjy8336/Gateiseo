package com.gateiseo.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
public class ItemRequest {
    @NotBlank(message = "품목 이름을 입력해주세요")
    private String name;

    @NotNull(message = "가격을 입력해주세요")
    @Min(value = 0, message = "가격은 0원 이상이어야 합니다")
    private Integer price;

    @Min(value = 1, message = "수량은 1개 이상이어야 합니다")
    private Integer quantity = 1;

    private Boolean isShared = true;
}
