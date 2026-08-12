'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import { Link2, ReceiptText, ShoppingCart, Wallet } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn()) router.replace('/home');
    }, [router]);

    const handleKakaoLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
        const redirectUri = `${window.location.origin}/auth/callback`;
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
        console.log('kakaoAuthUrl:', kakaoAuthUrl);
        window.location.href = kakaoAuthUrl;
    };

    const features = [
        {
            Icon: Link2,
            bg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            title: '링크 하나로 초대',
            sub: '초대코드로 바로 참여',
        },
        {
            Icon: ReceiptText,
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            title: '실시간 장바구니 공유',
            sub: '품목 추가하면 바로 반영',
        },
        {
            Icon: Wallet,
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            title: '자동 정산 계산',
            sub: 'n빵 · 품목별 분담 모두 지원',
        },
    ];

    return (
        <main className="min-h-screen bg-[#F7F6F2] flex flex-col">
            <div className="bg-[#1A1A2E] px-7 pt-16 pb-10 relative overflow-hidden">
                <div className="absolute w-[200px] h-[200px] bg-[#4F46E5] rounded-full -top-20 -right-14 opacity-25" />
                <div className="absolute w-[120px] h-[120px] bg-[#7C3AED] rounded-full -bottom-8 left-5 opacity-20" />
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 relative z-10">
                    <ShoppingCart className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight relative z-10 leading-tight">같이사</h1>
                <p className="text-sm text-white/55 mt-2 relative z-10 leading-relaxed">
                    친구들과 같이 사고,
                    <br />
                    정산은 자동으로.
                </p>
            </div>

            <div className="flex flex-col gap-3 px-5 pt-6">
                {features.map((f) => (
                    <div
                        key={f.title}
                        className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-neutral-100"
                    >
                        <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <f.Icon className={`w-5 h-5 ${f.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-neutral-900">{f.title}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">{f.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-auto px-5 pb-10 pt-6">
                <button
                    onClick={handleKakaoLogin}
                    className="w-full bg-[#FEE500] rounded-2xl py-4 flex items-center justify-center gap-3 text-[15px] font-bold text-neutral-900 active:scale-[0.98] transition-transform"
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#1A1A1A">
                        <path d="M12 3C6.477 3 2 6.477 2 11c0 2.917 1.672 5.468 4.203 6.994L5.2 21.6a.5.5 0 00.74.535L10.1 19.8A11.6 11.6 0 0012 20c5.523 0 10-3.477 10-8S17.523 3 12 3z" />
                    </svg>
                    카카오로 시작하기
                </button>
                <p className="text-center text-[11px] text-neutral-400 mt-4 leading-relaxed">
                    로그인 시 <span className="underline cursor-pointer">이용약관</span> 및{' '}
                    <span className="underline cursor-pointer">개인정보처리방침</span>에<br />
                    동의하는 것으로 간주됩니다.
                </p>
            </div>
        </main>
    );
}
