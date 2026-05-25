import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  // 카카오 code인지 확인 (state 파라미터 없으면 카카오 직접 연동)
  const isKakao = searchParams.get('state') === null || searchParams.has('code') && !searchParams.has('next');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) {
            try { cookieStore.set({ name, value, ...options }); } catch { }
          },
          remove(name: string, options: any) {
            try { cookieStore.delete({ name, ...options }); } catch { }
          },
        },
      }
    );

    // Supabase OAuth 콜백 먼저 시도
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Supabase 실패 시 카카오 직접 처리
    try {
      // 1. 카카오 액세스 토큰 받기
      const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
          redirect_uri: `${origin}/auth/callback`,
          code,
          client_secret: process.env.KAKAO_CLIENT_SECRET!,
        }),
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. 카카오 사용자 정보 받기
      const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userData = await userRes.json();
      const kakaoId = userData.id;
      const nickname = userData.kakao_account?.profile?.nickname || '카카오유저';
      const profileImage = userData.kakao_account?.profile?.profile_image_url || '';

      // 3. Supabase에 임시 이메일로 로그인 (카카오 ID 기반)
      const fakeEmail = `kakao_${kakaoId}@okeydobokey.kakao`;
      const fakePassword = `kakao_${kakaoId}_${process.env.KAKAO_CLIENT_SECRET!.slice(0, 8)}`;

      // 먼저 로그인 시도
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: fakePassword,
      });

      if (signInError) {
        // 없으면 회원가입
        const { error: signUpError } = await supabase.auth.signUp({
          email: fakeEmail,
          password: fakePassword,
          options: {
            data: {
              full_name: nickname,
              avatar_url: profileImage,
              provider: 'kakao',
              kakao_id: kakaoId,
            }
          }
        });
        if (signUpError) throw signUpError;
      }

      return NextResponse.redirect(`${origin}/profile`);
    } catch (e) {
      console.error('Kakao direct auth error:', e);
    }
  }

  return NextResponse.redirect(`${origin}/profile?error=auth-failed`);
}