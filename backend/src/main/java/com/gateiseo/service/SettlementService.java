package com.gateiseo.service;

import com.gateiseo.domain.*;
import com.gateiseo.dto.SettlementResponse;
import com.gateiseo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final SettlementRepository settlementRepository;

    @Transactional
    public List<SettlementResponse> settle(UUID roomId, User user) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다"));

        if (!room.getHost().getId().equals(user.getId())) {
            throw new IllegalStateException("방장만 정산을 시작할 수 있습니다");
        }

        // 기존 정산 삭제 후 재계산
        settlementRepository.deleteAllByRoomId(roomId);

        List<User> members = roomMemberRepository.findAllByRoomId(roomId)
                .stream().map(RoomMember::getUser).collect(Collectors.toList());

        int memberCount = members.size();

        // 공동 항목 합산
        int sharedTotal = room.getItems().stream()
                .filter(Item::getIsShared)
                .mapToInt(i -> i.getPrice() * i.getQuantity())
                .sum();

        int perPerson = (int) Math.ceil((double) sharedTotal / memberCount);

        // 각 멤버별 부담액 계산
        Map<UUID, Integer> owes = new HashMap<>();
        for (User member : members) {
            if (member.getId().equals(room.getHost().getId())) continue;

            // 개인 항목
            int personal = room.getItems().stream()
                    .filter(i -> !i.getIsShared() && i.getAddedBy().getId().equals(member.getId()))
                    .mapToInt(i -> i.getPrice() * i.getQuantity())
                    .sum();

            // 공동 항목 중 본인이 추가한 것 제외하고 n빵
            int sharedOwed = room.getItems().stream()
                    .filter(Item::getIsShared)
                    .mapToInt(i -> {
                        int share = (int) Math.ceil((double)(i.getPrice() * i.getQuantity()) / memberCount);
                        return i.getAddedBy().getId().equals(member.getId()) ? 0 : share;
                    })
                    .sum();

            owes.put(member.getId(), personal + sharedOwed);
        }

        // 정산 저장
        List<Settlement> settlements = new ArrayList<>();
        for (User member : members) {
            if (!owes.containsKey(member.getId())) continue;
            settlements.add(settlementRepository.save(Settlement.builder()
                    .room(room)
                    .payer(member)
                    .receiver(room.getHost())
                    .amount(owes.get(member.getId()))
                    .build()));
        }

        return settlements.stream()
                .map(SettlementResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public SettlementResponse markPaid(UUID settlementId, User user) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("정산 내역을 찾을 수 없습니다"));

        settlement.markPaid();
        return SettlementResponse.from(settlement);
    }

    @Transactional(readOnly = true)
    public List<SettlementResponse> getSettlements(UUID roomId) {
        return settlementRepository.findAllByRoomId(roomId)
                .stream().map(SettlementResponse::from).collect(Collectors.toList());
    }
}
