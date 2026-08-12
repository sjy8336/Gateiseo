'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { saveToken, saveUser } from '@/lib/auth';
import { Suspense } from 'react';
import { ShoppingCart } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        const code = params.get('code');
        if (!code) {
            router.replace('/');
            return;
        }
        handleCallback(code);
    }, [params, router]);

    const handleCallback = async (code: string) => {
        try {
            const redirectUri = `${window.location.origin}/auth/callback`;

            // 백엔드가 카카오 토큰 교환과 사용자 조회를 모두 처리
            const { accessToken, user } = await authApi.kakaoLogin(code, redirectUri);

            // 저장
            saveToken(accessToken);
            saveUser(user);

            router.replace('/home');
        } catch (e) {
            console.error('로그인 실패:', e);
            router.replace('/');
        }
    };

    return (
        <main className="min-h-screen bg-[#F7F6F2] flex items-center justify-center flex-col gap-4">
            <div className="animate-bounce">
                <ShoppingCart className="w-10 h-10 text-indigo-600" />
            </div>
            <p className="text-sm text-neutral-400">로그인 중...</p>
        </main>
    );
}

export default function CallbackPage() {
    return (
        <Suspense>
            <CallbackContent />
        </Suspense>
    );
}
