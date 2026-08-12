package com.gateiseo.controller;

import com.gateiseo.common.ApiResponse;
import com.gateiseo.domain.User;
import com.gateiseo.dto.ItemRequest;
import com.gateiseo.dto.RoomResponse;
import com.gateiseo.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse.ItemInfo>> addItem(
            @PathVariable UUID roomId,
            @Valid @RequestBody ItemRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("품목이 추가됐어요!", itemService.addItem(roomId, request, user)));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable UUID roomId,
            @PathVariable UUID itemId,
            @AuthenticationPrincipal User user) {
        itemService.deleteItem(roomId, itemId, user);
        return ResponseEntity.ok(ApiResponse.ok("품목이 삭제됐어요!", null));
    }
}