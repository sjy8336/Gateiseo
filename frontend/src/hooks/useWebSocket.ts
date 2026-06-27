import { useEffect, useRef, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') ?? 'ws://localhost:8080';

export type ItemUpdateMessage = {
    action: 'ADD' | 'DELETE';
    item?: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        isShared: boolean;
        addedByNickname: string;
    };
    deletedItemId?: string;
    updatedBy: string;
};

export function useRoomWebSocket(roomId: string, onMessage: (msg: ItemUpdateMessage) => void) {
    const wsRef = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);
    const isActiveRef = useRef(false);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    onMessageRef.current = onMessage;

    const connect = useCallback(() => {
        const ws = new WebSocket(`${WS_URL}/ws`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[WS] connected');
            // STOMP CONNECT 프레임
            ws.send('CONNECT\naccept-version:1.2\nheart-beat:0,0\n\n\0');
        };

        ws.onmessage = (event) => {
            const data = event.data as string;

            // STOMP CONNECTED 응답 → 구독 등록
            if (data.startsWith('CONNECTED')) {
                ws.send(`SUBSCRIBE\nid:sub-0\ndestination:/topic/rooms/${roomId}\n\n\0`);
                return;
            }

            // MESSAGE 프레임 파싱
            if (data.startsWith('MESSAGE')) {
                const bodyStart = data.indexOf('\n\n') + 2;
                const body = data.slice(bodyStart).replace('\0', '');
                try {
                    const msg: ItemUpdateMessage = JSON.parse(body);
                    onMessageRef.current(msg);
                } catch (e) {
                    console.error('[WS] parse error', e);
                }
            }
        };

        ws.onerror = (e) => {
            if (wsRef.current !== ws) return;
            if (!isActiveRef.current) return;
            console.error('[WS] error', e);
        };
        ws.onclose = () => {
            if (wsRef.current !== ws) return;
            if (!isActiveRef.current) return;
            console.log('[WS] disconnected — reconnecting in 3s');
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = setTimeout(connect, 3000);
        };
    }, [roomId]);

    useEffect(() => {
        isActiveRef.current = true;
        const startTimer = setTimeout(connect, 0);
        return () => {
            isActiveRef.current = false;
            clearTimeout(startTimer);
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            const ws = wsRef.current;
            wsRef.current = null;
            ws?.close();
        };
    }, [connect]);
}
