'use client';

import { Fragment, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi } from '@/lib/api';
import { ChevronLeft, KeyRound } from 'lucide-react';

export default function JoinPage() {
    const router = useRouter();
    const [code, setCode] = useState<string[]>(Array(8).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = async (index: number, value: string) => {
        const char = value.toUpperCase().slice(-1);
        const next = [...code];
        next[index] = char;
        setCode(next);
        setError('');

        if (char && index < 7) {
            inputRefs.current[index + 1]?.focus();
        }

        if (char && index === 7) {
            const fullCode = next.join('');
            if (fullCode.length === 8) {
                await handleJoin(fullCode);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleJoin = async (inviteCode: string) => {
        setLoading(true);
        setError('');
        try {
            const room = await roomApi.join(inviteCode);
            router.push(`/rooms/${room.id}`);
        } catch (e: any) {
            setError(e.message);
            setCode(Array(8).fill(''));
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const filledCount = code.filter((c) => c !== '').length;

    return (
        <main className="min-h-screen bg-neutral-100 flex flex-col">
            <div className="bg-[#1A1A2E] px-5 pt-14 pb-5 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm shrink-0"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <h1 className="text-[17px] font-medium text-white">코드로 입장</h1>
            </div>

            <div className="flex flex-col items-center px-4 py-10 flex-1">
                <div className="w-14 h-14 mb-4 rounded-2xl bg-[#FEE500] flex items-center justify-center">
                    <KeyRound className="w-7 h-7 text-neutral-900" />
                </div>
                <p className="text-[15px] font-medium text-neutral-900">초대코드를 입력해주세요</p>
                <p className="text-sm text-neutral-400 mt-2 text-center leading-relaxed">
                    친구에게 받은 8자리 코드를 입력하면
                    <br />
                    바로 방에 참여할 수 있어요
                </p>

                <div className="flex gap-2 mt-8 items-center">
                    {Array(8)
                        .fill(0)
                        .map((_, i) => (
                            <Fragment key={i}>
                                {i === 4 && <div className="w-3 h-0.5 bg-neutral-300 rounded" />}
                                <input
                                    ref={(el) => {
                                        inputRefs.current[i] = el;
                                    }}
                                    className={`w-9 h-11 text-center text-lg font-medium rounded-xl border outline-none transition-colors
                  ${code[i] ? 'bg-indigo-50 border-[#1A1A2E] text-[#1A1A2E]' : 'bg-white border-neutral-200 text-neutral-900'}
                  focus:border-[#1A1A2E]`}
                                    value={code[i]}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    maxLength={1}
                                    disabled={loading}
                                />
                            </Fragment>
                        ))}
                </div>

                {error && <p className="text-xs text-red-400 mt-4">{error}</p>}
                {!error && (
                    <p className="text-xs text-neutral-400 mt-4">
                        {loading
                            ? '입장 중...'
                            : filledCount < 8
                              ? `${8 - filledCount}자리 더 입력하면 자동으로 입장돼요`
                              : '입장 중...'}
                    </p>
                )}
            </div>

            <div className="px-4 pb-10">
                <button
                    onClick={() => handleJoin(code.join(''))}
                    disabled={filledCount < 8 || loading}
                    className="w-full bg-[#1A1A2E] disabled:bg-neutral-300 text-white rounded-2xl py-4 text-[15px] font-medium transition-colors"
                >
                    {loading ? '입장 중...' : '입장하기'}
                </button>
            </div>
        </main>
    );
}
