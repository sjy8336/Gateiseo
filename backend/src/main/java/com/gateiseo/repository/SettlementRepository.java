package com.gateiseo.repository;

import com.gateiseo.domain.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SettlementRepository extends JpaRepository<Settlement, UUID> {
    List<Settlement> findAllByRoomId(UUID roomId);
    void deleteAllByRoomId(UUID roomId);
}
