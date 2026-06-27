package com.gateiseo.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateiseo.dto.RoomResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ItemWebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    // 클라이언트가 /app/rooms/{roomId}/items 로 메시지 보내면
    // /topic/rooms/{roomId} 구독 중인 모든 멤버에게 브로드캐스트
    @MessageMapping("/rooms/{roomId}/items")
    public void handleItemUpdate(
            @DestinationVariable String roomId,
            @Payload ItemUpdateMessage message) {

        log.debug("WebSocket item update - roomId: {}, action: {}", roomId, message.getAction());

        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId,
                message
        );
    }

    // WebSocket으로 전달되는 메시지 포맷
    @lombok.Getter
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ItemUpdateMessage {
        private String action;       // "ADD" | "DELETE"
        private RoomResponse.ItemInfo item;
        private String deletedItemId;
        private String updatedBy;    // 누가 변경했는지
    }
}