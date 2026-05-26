import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// profiles 테이블에 avatar_url 저장하는 헬퍼
async function upsertProfile(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  avatarUrl: string,
  nickname?: string
) {
  const updates: Record<string, string> = { avatar_url: avatarUrl };
  if (nickname) updates.nickname = nickname;

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' });

  console.log('upsertProfile result:', { userId, avatarUrl, error });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

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

    // ✅ 구글 등 Supabase OAuth 콜백 처리
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.user) {
      const user = sessionData.user;
      const avatarUrl = user.user_metadata?.avatar_url || '';
      const nickname = user.user_metadata?.full_name || user.user_metadata?.name || '';

      // 구글/기타 소셜 프로필 사진 저장
      if (avatarUrl) {
        await upsertProfile(supabase, user.id, avatarUrl, nickname);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    // ✅ 카카오 직접 처리 (Supabase OAuth 실패 시)
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
      const fakePassword = '임시비밀번호123!';
      let userId: string | null = null;

      // 먼저 로그인 시도
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: fakePassword,
      });

      if (!signInError && signInData?.user) {
        userId = signInData.user.id;
      } else {
        // 없으면 회원가입
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
        userId = signUpData?.user?.id ?? null;
      }

      // ✅ profiles 테이블에 카카오 프로필 사진 저장
      if (userId && profileImage) {
        await upsertProfile(supabase, userId, profileImage, nickname);
      }

      return NextResponse.redirect(`${origin}/profile`);
    } catch (e) {
      console.error('Kakao direct auth error:', e);
    }
  }

  return NextResponse.redirect(`${origin}/profile?error=auth-failed`);
}