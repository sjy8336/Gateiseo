'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi, RoomSummary } from '@/lib/api';
import { getUser, isLoggedIn, removeToken } from '@/lib/auth';
import { Hand, KeyRound, ShoppingCart } from 'lucide-react';

const AVATAR_COLORS = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
];

export default function HomePage() {
    const router = useRouter();
    const [rooms, setRooms] = useState<RoomSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

    const handleLogout = () => {
        if (!confirm('로그아웃할까요?')) return;
        removeToken();
        router.replace('/');
    };

    useEffect(() => {
        setUser(getUser());

        if (!isLoggedIn()) {
            router.replace('/');
            return;
        }
        roomApi
            .getMy()
            .then(setRooms)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [router]);

    return (
        <main className="min-h-screen bg-neutral-100 flex flex-col">
            <div className="bg-[#1A1A2E] px-5 pt-14 pb-5 flex items-center justify-between">
                <div>
                    <p className="text-xs text-white/50 flex items-center gap-1">
                        안녕하세요
                        <Hand className="w-3.5 h-3.5 text-white/75" />
                    </p>
                    <h1 className="text-xl font-medium text-white mt-0.5">{user?.nickname ?? ''}님</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLogout}
                        className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80 active:scale-[0.98] transition-transform"
                    >
                        로그아웃
                    </button>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700">
                        {user?.nickname?.[0] ?? '?'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4 py-4">
                <button
                    onClick={() => router.push('/rooms/new')}
                    className="bg-white rounded-2xl p-4 flex flex-col gap-2 border border-neutral-100 text-left active:scale-[0.98] transition-transform"
                >
                    <div className="w-9 h-9 bg-[#1A1A2E] rounded-xl flex items-center justify-center text-white text-lg">
                        +
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-900">방 만들기</p>
                        <p className="text-xs text-neutral-400 mt-0.5">새 장바구니 시작</p>
                    </div>
                </button>
                <button
                    onClick={() => router.push('/join')}
                    className="bg-white rounded-2xl p-4 flex flex-col gap-2 border border-neutral-100 text-left active:scale-[0.98] transition-transform"
                >
                    <div className="w-9 h-9 bg-[#FEE500] rounded-xl flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-neutral-900" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-neutral-900">코드로 입장</p>
                        <p className="text-xs text-neutral-400 mt-0.5">초대받은 방 참여</p>
                    </div>
                </button>
            </div>

            <div className="px-4 flex-1">
                <p className="text-xs font-medium text-neutral-400 mb-3">참여 중인 방</p>

                {loading && <div className="text-center py-12 text-neutral-400 text-sm">불러오는 중...</div>}

                {error && <div className="text-center py-12 text-red-400 text-sm">{error}</div>}

                {!loading && !error && rooms.length === 0 && (
                    <div className="text-center py-12 text-neutral-400">
                        <div className="mb-3 flex items-center justify-center">
                            <ShoppingCart className="w-10 h-10 text-neutral-300" />
                        </div>
                        <p className="text-sm">아직 참여한 방이 없어요</p>
                        <p className="text-xs mt-1">방을 만들거나 초대코드로 입장해보세요</p>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {rooms.map((room, i) => (
                        <button
                            key={room.id}
                            onClick={() => router.push(`/rooms/${room.id}`)}
                            className="bg-white rounded-2xl p-4 border border-neutral-100 text-left w-full active:scale-[0.99] transition-transform"
                        >
                            <div className="flex items-start justify-between">
                                <p className="text-[15px] font-medium text-neutral-900">{room.title}</p>
                                <span
                                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${room.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}
                                >
                                    {room.status === 'ACTIVE' ? '진행 중' : '정산 완료'}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-1">
                                <span className="text-xs text-neutral-400">품목 {room.items.length}개</span>
                                <span className="text-xs text-neutral-300">·</span>
                                <span className="text-xs text-neutral-400">{room.members.length}명</span>
                            </div>
                            <div className="h-px bg-neutral-100 my-3" />
                            <div className="flex items-center justify-between">
                                <div className="flex">
                                    {room.members.slice(0, 4).map((m, j) => (
                                        <div
                                            key={m.id}
                                            style={{ marginLeft: j === 0 ? 0 : -6 }}
                                            className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-medium ${AVATAR_COLORS[j % AVATAR_COLORS.length]}`}
                                        >
                                            {m.nickname[0]}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-neutral-900">
                                    {room.totalAmount.toLocaleString()}원
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-8" />
        </main>
    );
}
