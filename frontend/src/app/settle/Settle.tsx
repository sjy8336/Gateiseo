'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { settlementApi, SettlementInfo } from '@/lib/api';
import { ArrowRight, Check, ChevronLeft, FileText, Link2 } from 'lucide-react';

export default function SettlePage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params.id as string | undefined;

    const [settlements, setSettlements] = useState<SettlementInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [settling, setSettling] = useState(false);
    const [error, setError] = useState('');
    const [openIds, setOpenIds] = useState<string[]>([]);

    useEffect(() => {
        if (!roomId) {
            setError('정산할 방을 찾을 수 없어요.');
            setLoading(false);
            return;
        }

        settlementApi
            .getList(roomId)
            .then((data) => {
                if (data.length === 0) handleSettle();
                else setSettlements(data);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [roomId]);

    const handleSettle = async () => {
        if (!roomId) return;
        setSettling(true);
        try {
            const data = await settlementApi.settle(roomId);
            setSettlements(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSettling(false);
            setLoading(false);
        }
    };

    const handleMarkPaid = async (id: string) => {
        try {
            const updated = await settlementApi.markPaid(id);
            setSettlements((prev) => prev.map((s) => (s.id === id ? updated : s)));
        } catch (e: any) {
            alert(e.message);
        }
    };

    const toggleBreakdown = (id: string) => {
        setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const totalAmount = settlements.reduce((s, i) => s + i.amount, 0);
    const paidCount = settlements.filter((s) => s.isPaid).length;

    if (loading || settling)
        return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center text-sm text-neutral-400">
                {settling ? '정산 계산 중...' : '불러오는 중...'}
            </div>
        );

    if (error) {
        return (
            <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center px-6 text-center">
                <div className="mb-4">
                    <FileText className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-lg font-medium text-neutral-900">정산 정보를 불러올 수 없어요</h1>
                <p className="text-sm text-neutral-400 mt-2">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-6 bg-[#1A1A2E] text-white rounded-2xl px-5 py-3 text-sm font-medium"
                >
                    돌아가기
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-100 flex flex-col">
            <div className="bg-[#1A1A2E] px-5 pt-14 pb-5">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => router.back()}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h1 className="text-[17px] font-medium text-white">정산 결과</h1>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                    <p className="text-xs text-white/50">총 정산 금액</p>
                    <p className="text-[26px] font-medium text-white mt-1 tracking-tight">
                        {totalAmount.toLocaleString()}원
                    </p>
                    <p className="text-xs text-white/45 mt-1">
                        {settlements.length}건 · {paidCount}/{settlements.length} 완료
                    </p>
                </div>
            </div>

            <div className="px-4 py-4 flex-1">
                <p className="text-xs font-medium text-neutral-400 mb-3">송금 내역</p>
                <div className="flex flex-col gap-2">
                    {settlements.map((s) => (
                        <div key={s.id} className="bg-white rounded-2xl p-4 border border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700 shrink-0">
                                    {s.payerNickname[0]}
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-0.5">
                                    <span className="text-sm font-medium text-neutral-900">
                                        {s.amount.toLocaleString()}원
                                    </span>
                                    <div className="flex items-center gap-1 w-full">
                                        <div className="flex-1 h-px bg-neutral-200" />
                                        <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                                    </div>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-700 shrink-0">
                                    {s.receiverNickname[0]}
                                </div>
                                {s.isPaid ? (
                                    <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full shrink-0 inline-flex items-center gap-1">
                                        <Check className="w-3 h-3 text-emerald-600" /> 완료
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleMarkPaid(s.id)}
                                        className="text-[11px] font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full shrink-0"
                                    >
                                        송금하기
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-neutral-100">
                                <span className="text-xs text-neutral-400">
                                    {s.payerNickname} → {s.receiverNickname}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 pb-10 flex flex-col gap-2">
                <button className="w-full bg-[#FEE500] rounded-2xl py-4 text-[15px] font-bold text-neutral-900 flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#1A1A1A">
                        <path d="M12 3C6.477 3 2 6.477 2 11c0 2.917 1.672 5.468 4.203 6.994L5.2 21.6a.5.5 0 00.74.535L10.1 19.8A11.6 11.6 0 0012 20c5.523 0 10-3.477 10-8S17.523 3 12 3z" />
                    </svg>
                    카카오톡으로 공유하기
                </button>
                <button
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="w-full bg-white border border-neutral-200 rounded-2xl py-3.5 text-sm font-medium text-neutral-700 flex items-center justify-center gap-2"
                >
                    <Link2 className="w-4 h-4 text-indigo-500" /> 링크 복사
                </button>
            </div>
        </main>
    );
}
