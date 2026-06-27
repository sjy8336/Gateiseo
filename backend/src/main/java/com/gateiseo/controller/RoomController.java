package com.gateiseo.controller;

import com.gateiseo.common.ApiResponse;
import com.gateiseo.domain.User;
import com.gateiseo.dto.RoomRequest;
import com.gateiseo.dto.RoomResponse;
import com.gateiseo.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @Valid @RequestBody RoomRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("방이 생성됐어요!", roomService.createRoom(request, user)));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<RoomResponse>> joinRoom(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("방에 입장했어요!", roomService.joinRoom(body.get("inviteCode"), user)));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getRoom(roomId, user)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getMyRooms(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(roomService.getMyRooms(user)));
    }
}