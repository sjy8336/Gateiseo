const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
        throw new Error(json.message ?? '요청에 실패했습니다');
    }

    return json.data;
}

// ─── Auth ───────────────────────────────────────────
export const authApi = {
    kakaoLogin: (code: string, redirectUri: string) =>
        request<{ accessToken: string; user: { id: string; nickname: string; profileImage: string } }>(
            '/api/auth/kakao',
            { method: 'POST', body: JSON.stringify({ code, redirectUri }) }
        ),
};

// ─── Room ───────────────────────────────────────────
export const roomApi = {
    create: (title: string, memo?: string) =>
        request<RoomDetail>('/api/rooms', {
            method: 'POST',
            body: JSON.stringify({ title, memo }),
        }),

    join: (inviteCode: string) =>
        request<RoomDetail>('/api/rooms/join', {
            method: 'POST',
            body: JSON.stringify({ inviteCode }),
        }),

    getOne: (roomId: string) => request<RoomDetail>(`/api/rooms/${roomId}`),

    getMy: () => request<RoomSummary[]>('/api/rooms/my'),
};

// ─── Item ───────────────────────────────────────────
export const itemApi = {
    add: (roomId: string, data: { name: string; price: number; quantity: number; isShared: boolean }) =>
        request<ItemInfo>(`/api/rooms/${roomId}/items`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    delete: (roomId: string, itemId: string) =>
        request<void>(`/api/rooms/${roomId}/items/${itemId}`, {
            method: 'DELETE',
        }),
};

// ─── Settlement ─────────────────────────────────────
export const settlementApi = {
    settle: (roomId: string) => request<SettlementInfo[]>(`/api/rooms/${roomId}/settle`, { method: 'POST' }),

    getList: (roomId: string) => request<SettlementInfo[]>(`/api/rooms/${roomId}/settlements`),

    markPaid: (settlementId: string) =>
        request<SettlementInfo>(`/api/settlements/${settlementId}/pay`, { method: 'PUT' }),
};

// ─── Types ──────────────────────────────────────────
export type RoomSummary = {
    id: string;
    title: string;
    memo: string;
    inviteCode: string;
    status: 'ACTIVE' | 'SETTLED';
    host: MemberInfo;
    members: MemberInfo[];
    items: ItemInfo[];
    totalAmount: number;
};

export type RoomDetail = RoomSummary;

export type MemberInfo = {
    id: string;
    nickname: string;
    profileImage?: string;
    isHost: boolean;
};

export type ItemInfo = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    isShared: boolean;
    addedByNickname: string;
};

export type SettlementInfo = {
    id: string;
    payerNickname: string;
    receiverNickname: string;
    amount: number;
    isPaid: boolean;
};
