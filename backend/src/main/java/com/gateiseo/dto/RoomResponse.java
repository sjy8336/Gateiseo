package com.gateiseo.dto;

import com.gateiseo.domain.Room;
import com.gateiseo.domain.Item;
import lombok.Builder;
import lombok.Getter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter @Builder
public class RoomResponse {
    private UUID id;
    private String title;
    private String memo;
    private String inviteCode;
    private String status;
    private MemberInfo host;
    private List<MemberInfo> members;
    private List<ItemInfo> items;
    private int totalAmount;

    @Getter @Builder
    public static class MemberInfo {
        private UUID id;
        private String nickname;
        private String profileImage;
        private boolean isHost;
    }

    @Getter @Builder
    public static class ItemInfo {
        private UUID id;
        private String name;
        private int price;
        private int quantity;
        private boolean isShared;
        private String addedByNickname;
    }

    public static RoomResponse from(Room room) {
        List<UUID> memberUserIds = room.getMembers().stream()
                .map(m -> m.getUser().getId()).collect(Collectors.toList());

        List<MemberInfo> memberInfos = room.getMembers().stream()
                .map(m -> MemberInfo.builder()
                        .id(m.getUser().getId())
                        .nickname(m.getUser().getNickname())
                        .profileImage(m.getUser().getProfileImage())
                        .isHost(m.getUser().getId().equals(room.getHost().getId()))
                        .build())
                .collect(Collectors.toList());

        List<ItemInfo> itemInfos = room.getItems().stream()
                .map(i -> ItemInfo.builder()
                        .id(i.getId())
                        .name(i.getName())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .isShared(i.getIsShared())
                        .addedByNickname(i.getAddedBy().getNickname())
                        .build())
                .collect(Collectors.toList());

        int total = room.getItems().stream()
                .mapToInt(i -> i.getPrice() * i.getQuantity()).sum();

        return RoomResponse.builder()
                .id(room.getId())
                .title(room.getTitle())
                .memo(room.getMemo())
                .inviteCode(room.getInviteCode())
                .status(room.getStatus().name())
                .host(MemberInfo.builder()
                        .id(room.getHost().getId())
                        .nickname(room.getHost().getNickname())
                        .build())
                .members(memberInfos)
                .items(itemInfos)
                .totalAmount(total)
                .build();
    }
}
