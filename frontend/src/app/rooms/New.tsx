import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi } from '@/lib/api';

export default function NewRoomPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [memo, setMemo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!title.trim()) return;
        setLoading(true);
        setError('');
        try {
            const room = await roomApi.create(title.trim(), memo.trim() || undefined);
            router.push(
                `/rooms/created?code=${room.inviteCode}&title=${encodeURIComponent(room.title)}&roomId=${room.id}`
            );
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-100 flex flex-col">
            <div className="bg-[#1A1A2E] px-5 pt-14 pb-5 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm shrink-0"
                >
                    ←
                </button>
                <h1 className="text-[17px] font-medium text-white">방 만들기</h1>
            </div>

            <div className="px-4 py-6 flex flex-col gap-4 flex-1">
                <div>
                    <p className="text-xs text-neutral-400 mb-2">
                        방 이름 <span className="text-red-400">*</span>
                    </p>
                    <input
                        className="w-full bg-white border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-300"
                        placeholder="예) MT 장보기, 회식 준비..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={30}
                    />
                    <p className="text-xs text-neutral-400 mt-2">
                        함께하는 사람들이 알아볼 수 있는 이름으로 지어주세요
                    </p>
                </div>
                <div>
                    <p className="text-xs text-neutral-400 mb-2">메모 (선택)</p>
                    <input
                        className="w-full bg-white border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-300"
                        placeholder="예) 6월 제주도 MT"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        maxLength={50}
                    />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            <div className="px-4 pb-10">
                <button
                    onClick={handleCreate}
                    disabled={!title.trim() || loading}
                    className="w-full bg-[#1A1A2E] disabled:bg-neutral-300 text-white rounded-2xl py-4 text-[15px] font-medium transition-colors"
                >
                    {loading ? '생성 중...' : '방 만들기'}
                </button>
            </div>
        </main>
    );
}
