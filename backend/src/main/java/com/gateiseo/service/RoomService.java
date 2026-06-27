package com.gateiseo.service;

import com.gateiseo.domain.*;
import com.gateiseo.dto.RoomRequest;
import com.gateiseo.dto.RoomResponse;
import com.gateiseo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;

    @Transactional
    public RoomResponse createRoom(RoomRequest request, User host) {
        Room room = roomRepository.save(Room.builder()
                .host(host)
                .title(request.getTitle())
                .memo(request.getMemo())
                .inviteCode(generateInviteCode())
                .build());

        // 방장도 멤버로 추가
        roomMemberRepository.save(RoomMember.builder()
                .room(room)
                .user(host)
                .build());

        return RoomResponse.from(roomRepository.findById(room.getId()).orElseThrow());
    }

    @Transactional
    public RoomResponse joinRoom(String inviteCode, User user) {
        Room room = roomRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대코드입니다"));

        if (roomMemberRepository.existsByRoomIdAndUserId(room.getId(), user.getId())) {
            throw new IllegalStateException("이미 참여 중인 방입니다");
        }

        roomMemberRepository.save(RoomMember.builder()
                .room(room)
                .user(user)
                .build());

        return RoomResponse.from(roomRepository.findById(room.getId()).orElseThrow());
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoom(UUID roomId, User user) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다"));

        if (!roomMemberRepository.existsByRoomIdAndUserId(roomId, user.getId())) {
            throw new IllegalStateException("해당 방에 접근 권한이 없습니다");
        }

        return RoomResponse.from(room);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getMyRooms(User user) {
        return roomRepository.findAllByMemberUserId(user.getId())
                .stream()
                .map(RoomResponse::from)
                .collect(Collectors.toList());
    }

    private String generateInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        String code;
        do {
            code = random.ints(8, 0, chars.length())
                    .mapToObj(i -> String.valueOf(chars.charAt(i)))
                    .collect(Collectors.joining());
        } while (roomRepository.findByInviteCode(code).isPresent());
        return code;
    }
}
