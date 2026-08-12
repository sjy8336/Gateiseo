package com.gateiseo.repository;

import com.gateiseo.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    Optional<Room> findByInviteCode(String inviteCode);

    @Query("SELECT r FROM Room r JOIN r.members m WHERE m.user.id = :userId ORDER BY r.createdAt DESC")
    List<Room> findAllByMemberUserId(UUID userId);
}
