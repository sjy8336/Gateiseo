package com.gateiseo.service;

import com.gateiseo.domain.*;
import com.gateiseo.dto.ItemRequest;
import com.gateiseo.dto.RoomResponse;
import com.gateiseo.exception.BusinessException;
import com.gateiseo.repository.*;
import com.gateiseo.websocket.ItemWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public RoomResponse.ItemInfo addItem(UUID roomId, ItemRequest request, User user) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> BusinessException.notFound("방을 찾을 수 없습니다"));

        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId())) {
            throw BusinessException.forbidden("해당 방에 접근 권한이 없습니다");
        }

        Item item = itemRepository.save(Item.builder()
                .room(room)
                .addedBy(user)
                .name(request.getName())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .isShared(request.getIsShared())
                .build());

        RoomResponse.ItemInfo itemInfo = RoomResponse.ItemInfo.builder()
                .id(item.getId())
                .name(item.getName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .isShared(item.getIsShared())
                .addedByNickname(user.getNickname())
                .build();

        // WebSocket 브로드캐스트 — 같은 방 멤버 전체에게 실시간 알림
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId,
                ItemWebSocketHandler.ItemUpdateMessage.builder()
                        .action("ADD")
                        .item(itemInfo)
                        .updatedBy(user.getNickname())
                        .build()
        );

        return itemInfo;
    }

    @Transactional
    public void deleteItem(UUID roomId, UUID itemId, User user) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> BusinessException.notFound("품목을 찾을 수 없습니다"));

        Room room = item.getRoom();
        boolean isHost = room.getHost().getId().equals(user.getId());
        boolean isOwner = item.getAddedBy().getId().equals(user.getId());

        if (!isHost && !isOwner) {
            throw BusinessException.forbidden("삭제 권한이 없습니다");
        }

        itemRepository.delete(item);

        // WebSocket 브로드캐스트 — 삭제 알림
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId,
                ItemWebSocketHandler.ItemUpdateMessage.builder()
                        .action("DELETE")
                        .deletedItemId(itemId.toString())
                        .updatedBy(user.getNickname())
                        .build()
        );
    }
}