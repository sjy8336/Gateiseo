'use client';

import Script from 'next/script';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, Check, ClipboardCopy, Lightbulb, Link2 } from 'lucide-react';

declare global {
    interface Window {
        Kakao?: {
            isInitialized: () => boolean;
            init: (key: string) => void;
            Share: {
                sendDefault: (options: {
                    objectType: 'feed';
                    content: {
                        title: string;
                        description: string;
                        imageUrl: string;
                        link: {
                            mobileWebUrl: string;
                            webUrl: string;
                        };
                    };
                    buttons: Array<{
                        title: string;
                        link: {
                            mobileWebUrl: string;
                            webUrl: string;
                        };
                    }>;
                }) => void;
            };
        };
    }
}

// 실제 구현 시: router.push("/rooms/created?code=AB12CD34&title=MT장보기&roomId=1")
function RoomCreatedContent() {
    const router = useRouter();
    const params = useSearchParams();
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [kakaoLoaded, setKakaoLoaded] = useState(false);
    const code = params.get('code') ?? 'AB12CD34';
    const title = params.get('title') ?? '새 방';
    const roomId = params.get('roomId') ?? '1';

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
        toastTimerRef.current = setTimeout(() => setToastMessage(null), 2200);
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

    const makeShareLink = () => `${window.location.origin}/join?code=${encodeURIComponent(code)}`;

    const handleCopyCode = async () => {
        try {
            await copyText(code);
            showToast('초대코드가 복사되었어요');
        } catch {
            showToast('복사에 실패했어요');
        }
    };

    const handleCopyLink = async () => {
        try {
            await copyText(makeShareLink());
            showToast('링크가 복사되었어요');
        } catch {
            showToast('복사에 실패했어요');
        }
    };

    const handleKakaoLoad = () => {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
        if (!kakaoKey || !window.Kakao) return;

        if (!window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoKey);
        }
        setKakaoLoaded(true);
    };

    const handleKakaoShare = () => {
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
        const shareUrl = makeShareLink();

        if (!kakaoKey || !window.Kakao || !kakaoLoaded) {
            showToast('카카오 공유 설정이 필요해요');
            return;
        }

        try {
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: `${title} 방에 초대받았어요`,
                    description: `초대코드 ${code}로 바로 참여해보세요`,
                    imageUrl: `${window.location.origin}/share/kakao-room-card.svg`,
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
                buttons: [
                    {
                        title: '방 참여하기',
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    },
                ],
            });
        } catch (error) {
            console.error('카카오 공유 실패:', error);
            showToast('카카오 공유를 열지 못했어요');
        }
    };

    return (
        <main className="min-h-screen bg-neutral-100 flex flex-col">
            <Script
                src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
                strategy="afterInteractive"
                onLoad={handleKakaoLoad}
            />
            {/* 히어로 */}
            <div className="bg-[#1A1A2E] px-6 pt-16 pb-10 text-center relative overflow-hidden">
                <div className="absolute w-[180px] h-[180px] bg-[#4F46E5] rounded-full -top-20 -right-12 opacity-20" />
                <div className="absolute w-[100px] h-[100px] bg-[#7C3AED] rounded-full -bottom-8 -left-5 opacity-15" />
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                    <Check className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-[22px] font-medium text-white relative z-10">방이 만들어졌어요!</h1>
                <p className="text-sm text-white/50 mt-2 relative z-10">아래 초대코드를 친구들에게 공유해주세요</p>
            </div>

            {/* 콘텐츠 */}
            <div className="px-4 py-5 flex flex-col gap-3 flex-1">
                {/* 초대코드 카드 */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-100">
                    <p className="text-xs text-neutral-400 mb-2">초대코드</p>
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-medium text-[#1A1A2E] tracking-widest font-mono">{code}</span>
                        <button
                            onClick={handleCopyCode}
                            className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-base active:scale-95 transition-transform"
                            aria-label="코드 복사"
                        >
                            <ClipboardCopy className="w-4 h-4 text-[#1A1A2E]" />
                        </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> 코드는 방 상세 화면에서 언제든 다시
                            확인할 수 있어요
                        </span>
                    </div>
                </div>

                {/* 공유 버튼 */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleKakaoShare}
                        className="bg-[#FEE500] rounded-2xl py-3.5 text-sm font-bold text-neutral-900 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="#1A1A1A">
                            <path d="M12 3C6.477 3 2 6.477 2 11c0 2.917 1.672 5.468 4.203 6.994L5.2 21.6a.5.5 0 00.74.535L10.1 19.8A11.6 11.6 0 0012 20c5.523 0 10-3.477 10-8S17.523 3 12 3z" />
                        </svg>
                        카카오 공유
                    </button>
                    <button
                        onClick={handleCopyLink}
                        className="bg-white border border-neutral-200 rounded-2xl py-3.5 text-sm font-medium text-neutral-700 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                        <Link2 className="w-4 h-4 text-indigo-500" /> 링크 복사
                    </button>
                </div>
            </div>

            {/* 시작 버튼 */}
            <div className="px-4 pb-10">
                <button
                    onClick={() => router.push(`/rooms/${roomId}`)}
                    className="w-full bg-[#1A1A2E] text-white rounded-2xl py-4 text-[15px] font-medium inline-flex items-center justify-center gap-2"
                >
                    장바구니 시작하기 <ArrowRight className="w-4 h-4 text-white/80" />
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
        </main>
    );
}

export default function RoomCreatedPage() {
    return (
        <Suspense>
            <RoomCreatedContent />
        </Suspense>
    );
}
