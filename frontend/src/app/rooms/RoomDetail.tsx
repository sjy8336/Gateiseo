import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { roomApi, itemApi, RoomDetail, ItemInfo } from '@/lib/api';
import { useRoomWebSocket } from '@/hooks/useWebSocket';
import {
    Beer,
    Beef,
    Calculator,
    ChevronLeft,
    Crown,
    CupSoda,
    Drumstick,
    Link2,
    Pizza,
    ShoppingCart,
    Toilet,
    X,
    type LucideIcon,
} from 'lucide-react';

const AVATAR_COLORS = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
];

const ITEM_ICONS: Record<string, LucideIcon> = {
    삼겹: Beef,
    고기: Beef,
    맥주: Beer,
    술: Beer,
    화장지: Toilet,
    휴지: Toilet,
    콜라: CupSoda,
    음료: CupSoda,
    소시지: Drumstick,
    치킨: Drumstick,
    피자: Pizza,
};

function getItemIcon(name: string): LucideIcon {
    for (const [key, Icon] of Object.entries(ITEM_ICONS)) {
        if (name.includes(key)) return Icon;
    }
    return ShoppingCart;
}

export default function RoomDetailPage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params.id as string;

    const [room, setRoom] = useState<RoomDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSheet, setShowSheet] = useState(false);
    const [form, setForm] = useState({ name: '', price: '', quantity: '1', isShared: true });
    const [submitting, setSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    const showToast = (message: string) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToastMessage(message);
        toastTimerRef.current = setTimeout(() => setToastMessage(''), 2200);
    };

    const copyText = async (text: string) => {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    };

    const handleCopyInviteLink = async () => {
        if (!room) return;
        try {
            await copyText(`${window.location.origin}/join?code=${room.inviteCode}`);
            showToast('초대링크가 복사되었어요');
        } catch {
            showToast('복사에 실패했어요');
        }
    };

    // WebSocket 실시간 연동
    useRoomWebSocket(roomId, (msg) => {
        if (msg.action === 'ADD' && msg.item) {
            setRoom((prev) => (prev ? { ...prev, items: [...prev.items, msg.item!] } : prev));
        }
        if (msg.action === 'DELETE' && msg.deletedItemId) {
            setRoom((prev) =>
                prev
                    ? {
                          ...prev,
                          items: prev.items.filter((i) => i.id !== msg.deletedItemId),
                      }
                    : prev
            );
        }
    });

    useEffect(() => {
        roomApi
            .getOne(roomId)
            .then(setRoom)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [roomId]);

    const handleAddItem = async () => {
        if (!form.name || !form.price) return;
        setSubmitting(true);
        try {
            await itemApi.add(roomId, {
                name: form.name,
                price: Number(form.price),
                quantity: Number(form.quantity) || 1,
                isShared: form.isShared,
            });
            setForm({ name: '', price: '', quantity: '1', isShared: true });
            setShowSheet(false);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('이 품목을 삭제할까요?')) return;
        try {
            await itemApi.delete(roomId, itemId);
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-sm text-neutral-400">
                불러오는 중...
            </div>
        );
    if (error)
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-sm text-red-400">
                {error}
            </div>
        );
    if (!room) return null;

    const totalAmount = room.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const sharedAmount = room.items.filter((i) => i.isShared).reduce((s, i) => s + i.price * i.quantity, 0);
    const perPerson = room.members.length > 0 ? Math.ceil(sharedAmount / room.members.length) : 0;

    return (
        <main className="min-h-screen bg-neutral-100 flex flex-col">
            <div className="bg-[#1A1A2E] px-5 pt-14 pb-5 flex items-center gap-3">
                <button
                    onClick={() => router.push('/home')}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1">
                    <h1 className="text-[17px] font-medium text-white">{room.title}</h1>
                    <p className="text-xs text-white/50 mt-0.5">
                        {room.members.length}명 참여 중 · 코드 {room.inviteCode}
                    </p>
                </div>
                <button
                    onClick={handleCopyInviteLink}
                    className="text-xs font-medium text-white bg-white/15 rounded-full px-3 py-1.5 inline-flex items-center gap-1"
                >
                    <Link2 className="w-3.5 h-3.5 text-white/85" /> 초대
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2 px-4 py-4">
                {[
                    { label: '총 금액', value: `${totalAmount.toLocaleString()}원` },
                    { label: '품목 수', value: `${room.items.length}개` },
                    { label: '1인당', value: `${perPerson.toLocaleString()}원` },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-neutral-100">
                        <p className="text-[11px] text-neutral-400">{s.label}</p>
                        <p className="text-sm font-medium text-neutral-900 mt-0.5">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="px-4 mb-4">
                <p className="text-xs font-medium text-neutral-400 mb-2">멤버</p>
                <div className="flex gap-4 overflow-x-auto pb-1">
                    {room.members.map((m, i) => (
                        <div key={m.id} className="flex flex-col items-center gap-1 shrink-0">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                            >
                                {m.nickname[0]}
                            </div>
                            <span className="text-[11px] text-neutral-400">
                                {m.isHost ? <Crown className="w-3 h-3 inline mr-0.5 text-amber-500" /> : null}
                                {m.nickname}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-neutral-400">장바구니</p>
                    <button
                        onClick={() => setShowSheet(true)}
                        className="w-7 h-7 rounded-full bg-[#1A1A2E] flex items-center justify-center text-white text-base"
                    >
                        +
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {room.items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-neutral-100"
                        >
                            {(() => {
                                const ItemIcon = getItemIcon(item.name);
                                return (
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.isShared ? 'bg-indigo-50' : 'bg-emerald-50'}`}
                                    >
                                        <ItemIcon
                                            className={`w-5 h-5 ${item.isShared ? 'text-indigo-600' : 'text-emerald-600'}`}
                                        />
                                    </div>
                                );
                            })()}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span
                                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${item.isShared ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}
                                    >
                                        {item.isShared ? '공동' : '개인'}
                                    </span>
                                    <span className="text-xs text-neutral-400">{item.addedByNickname} 추가</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-neutral-900">
                                    {(item.price * item.quantity).toLocaleString()}원
                                </p>
                                <p className="text-[11px] text-neutral-400">×{item.quantity}</p>
                            </div>
                            <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-neutral-300 hover:text-red-400 transition-colors ml-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 py-6">
                <button
                    onClick={() => router.push(`/settle/${roomId}`)}
                    className="w-full bg-[#1A1A2E] text-white rounded-2xl py-4 text-[15px] font-medium inline-flex items-center justify-center gap-2"
                >
                    <Calculator className="w-4 h-4 text-white/85" /> 정산 시작하기
                </button>
            </div>

            <div
                aria-live="polite"
                className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
                    toastMessage ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
                }`}
            >
                <div className="rounded-full bg-[#1A1A2E] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/20">
                    {toastMessage}
                </div>
            </div>

            {showSheet && (
                <div className="fixed inset-0 bg-black/40 z-10 flex items-end" onClick={() => setShowSheet(false)}>
                    <div className="bg-white w-full rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="w-9 h-1 bg-neutral-200 rounded-full mx-auto mb-4" />
                        <h2 className="text-base font-medium text-neutral-900 mb-4">품목 추가</h2>
                        <div className="flex flex-col gap-3">
                            <div>
                                <p className="text-xs text-neutral-400 mb-1.5">품목 이름</p>
                                <input
                                    className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-neutral-50"
                                    placeholder="예) 삼겹살, 음료수..."
                                    value={form.name}
                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-neutral-400 mb-1.5">가격</p>
                                    <input
                                        className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-neutral-50"
                                        placeholder="0"
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400 mb-1.5">수량</p>
                                    <input
                                        className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm bg-neutral-50"
                                        placeholder="1"
                                        type="number"
                                        value={form.quantity}
                                        onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400 mb-1.5">구분</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[true, false].map((shared) => (
                                        <button
                                            key={String(shared)}
                                            onClick={() => setForm((p) => ({ ...p, isShared: shared }))}
                                            className={`py-2.5 rounded-xl text-sm border transition-colors ${form.isShared === shared ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]' : 'border-neutral-200 text-neutral-500'}`}
                                        >
                                            {shared ? '공동 구매' : '개인 구매'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleAddItem}
                            disabled={submitting}
                            className="w-full mt-4 bg-[#FEE500] disabled:bg-neutral-200 rounded-2xl py-3.5 text-[15px] font-bold text-neutral-900"
                        >
                            {submitting ? '추가 중...' : '추가하기'}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
