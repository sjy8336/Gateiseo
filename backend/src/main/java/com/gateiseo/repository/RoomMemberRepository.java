package com.gateiseo.repository;

import com.gateiseo.domain.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    List<RoomMember> findAllByRoomId(UUID roomId);
    Optional<RoomMember> findByRoomIdAndUserId(UUID roomId, UUID userId);
    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);
}
