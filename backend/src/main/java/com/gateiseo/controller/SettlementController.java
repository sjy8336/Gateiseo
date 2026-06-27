package com.gateiseo.controller;

import com.gateiseo.common.ApiResponse;
import com.gateiseo.domain.User;
import com.gateiseo.dto.SettlementResponse;
import com.gateiseo.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @PostMapping("/rooms/{roomId}/settle")
    public ResponseEntity<ApiResponse<List<SettlementResponse>>> settle(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("정산이 완료됐어요!", settlementService.settle(roomId, user)));
    }

    @GetMapping("/rooms/{roomId}/settlements")
    public ResponseEntity<ApiResponse<List<SettlementResponse>>> getSettlements(
            @PathVariable UUID roomId) {
        return ResponseEntity.ok(ApiResponse.ok(settlementService.getSettlements(roomId)));
    }

    @PutMapping("/settlements/{settlementId}/pay")
    public ResponseEntity<ApiResponse<SettlementResponse>> markPaid(
            @PathVariable UUID settlementId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("송금 완료 처리됐어요!", settlementService.markPaid(settlementId, user)));
    }
}