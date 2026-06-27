package com.gateiseo.dto;

import com.gateiseo.domain.Settlement;
import lombok.Builder;
import lombok.Getter;
import java.util.UUID;

@Getter @Builder
public class SettlementResponse {
    private UUID id;
    private String payerNickname;
    private String receiverNickname;
    private int amount;
    private boolean isPaid;

    public static SettlementResponse from(Settlement s) {
        return SettlementResponse.builder()
                .id(s.getId())
                .payerNickname(s.getPayer().getNickname())
                .receiverNickname(s.getReceiver().getNickname())
                .amount(s.getAmount())
                .isPaid(s.getIsPaid())
                .build();
    }
}
