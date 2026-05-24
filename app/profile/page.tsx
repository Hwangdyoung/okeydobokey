'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/Profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { localUser, setLocalUser, isLoggedIn, logout, currentNickname, currentEmail, supabaseUser } = useAuth();

  // 닉네임 변경 관련 상태
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSuccess, setNicknameSuccess] = useState('');

  // 비밀번호 변경 관련 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (currentNickname) {
      setEditNickname(currentNickname);
    }
  }, [currentNickname]);

  const [view, setView] = useState<'login' | 'signup' | 'find' | 'changePassword'>('login');
  const [loginId, setLoginId] = useState(''); // 이메일 로그인 입력값
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  // 회원가입 관련 상태
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const isPwLongEnough = signupPw.length >= 6;
  const isPwHasSpecial = /[!@#$%^&*]/.test(signupPw);
  const isPwValid = isPwLongEnough && isPwHasSpecial;
  const [signupConfirmPw, setSignupConfirmPw] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupError, setSignupError] = useState('');

  // 이메일 인증 관련 상태
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // 계정 찾기 관련 상태 (탭 분리)
  const [findTab, setFindTab] = useState<'id' | 'password'>('id');
  const [findIdEmail, setFindIdEmail] = useState('');
  const [findPwEmail, setFindPwEmail] = useState('');
  const [findSuccessMessage, setFindSuccessMessage] = useState('');
  const [findError, setFindError] = useState('');

  const [activity, setActivity] = useState({
    postCount: 0,
    commentCount: 0,
    likeCount: 0,
    recentPosts: [] as any[]
  });

  const fetchActivity = async () => {
    if (!isLoggedIn || !currentEmail) return;
    try {
      const { data: allPosts } = await supabase
        .from('posts')
        .select('*, comments(*)')
        .order('created_at', { ascending: false });

      if (!allPosts) return;

      const myPosts = allPosts.filter((p: any) => p.author_email === currentEmail);

      let myCommentCount = 0;
      allPosts.forEach((p: any) => {
        const comments = Array.isArray(p.comments) ? p.comments : [];
        comments.forEach((c: any) => {
          if (c.author_email === currentEmail) myCommentCount++;
        });
      });

      const likedPosts = allPosts.filter((p: any) =>
        Array.isArray(p.liked_by) && p.liked_by.includes(currentEmail)
      );

      setActivity({
        postCount: myPosts.length,
        commentCount: myCommentCount,
        likeCount: likedPosts.length,
        recentPosts: myPosts.slice(0, 3).map((p: any) => ({
          id: p.id,
          title: p.title,
          date: p.date,
        })),
      });
    } catch (e) {
      console.error('Failed to fetch activity from Supabase', e);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [isLoggedIn, currentEmail]);

  // Supabase Auth 이메일 로그인 호출
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginId, // loginId state를 이메일 입력값으로 활용
        password: loginPw,
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError('이메일 또는 비밀번호가 잘못되었습니다.');
    }
  };

  // Supabase Auth 회원가입 및 OTP 메일 발송
  const handleSendVerification = async () => {
    if (!signupNickname.trim() || !signupEmail.trim() || !signupPw.trim() || !signupConfirmPw.trim()) {
      alert('모든 가입 정보를 입력해 주세요.');
      return;
    }
    if (signupPw !== signupConfirmPw) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      setSignupError('');
      setVerificationError('');
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPw,
        options: {
          data: {
            full_name: signupNickname
          },
          emailRedirectTo: undefined
        }
      });
      if (error) throw error;
      setVerificationSent(true);
      alert('인증 메일이 발송되었습니다. 이메일로 전송된 6자리 OTP 코드를 입력해 주세요.');
    } catch (err: any) {
      console.error('Send verification OTP error:', err);
      alert(err.message || '인증 메일 발송에 실패했습니다.');
    }
  };

  // Supabase OTP 인증 확인 (가입 최종 완료)
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setVerificationError('인증코드를 입력해 주세요.');
      return;
    }
    try {
      setVerificationError('');
      const { error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: verificationCode,
        type: 'signup' // type: signup
      });
      if (error) throw error;

      alert('회원가입이 완료되었습니다!');

      // 가입 완료 후 상태 초기화 및 로그인 뷰 전환
      setSignupEmail('');
      setSignupPw('');
      setSignupConfirmPw('');
      setSignupNickname('');
      setSignupError('');
      setVerificationSent(false);
      setVerificationCode('');
      setIsEmailVerified(false);
      setView('login');
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setVerificationError('인증 코드가 올바르지 않습니다.');
    }
  };

  // 아이디 찾기 핸들러 (이메일 기반 로그인에서는 이메일 주소 정보 재확인 안내)
  const handleFindId = (e: React.FormEvent) => {
    e.preventDefault();
    setFindError('');
    if (findIdEmail) {
      setFindSuccessMessage(`이메일 로그인 체계입니다. 로그인 시 입력하신 이메일(${findIdEmail})을 그대로 ID 칸에 입력해 주세요.`);
    } else {
      setFindError('이메일 주소를 정확히 입력해 주세요.');
    }
  };

  // 비밀번호 재설정 핸들러 (Supabase)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFindError('');
    setFindSuccessMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(findPwEmail, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      setFindSuccessMessage('이메일로 비밀번호 재설정 링크가 성공적으로 발송되었습니다.');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setFindError(err.message || '비밀번호 재설정 링크 발송에 실패했습니다.');
    }
  };

  // Supabase Auth 소셜 로그인 호출
  const handleSocialLogin = async (provider: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: 'https://okeydobokey.vercel.app/auth/callback'
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error(`${provider} login failed`, error);
    }
  };

  // 닉네임 수정 요청 핸들러
  const handleUpdateNickname = async () => {
    if (!editNickname.trim()) {
      setNicknameError('닉네임을 입력해 주세요.');
      return;
    }

    try {
      setNicknameError('');
      setNicknameSuccess('');

      if (supabaseUser) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: editNickname }
        });
        if (error) throw error;
      }

      setNicknameSuccess('닉네임이 변경되었습니다!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setNicknameError(err.message || '닉네임 변경에 실패했습니다.');
    }
  };

  // 비밀번호 수정 요청 핸들러
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setPasswordError('모든 비밀번호 필드를 입력해 주세요.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      setPasswordError('');
      setPasswordSuccess('');

      if (supabaseUser) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }

      setPasswordSuccess('비밀번호가 변경되었습니다!');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setView('login');
        setPasswordSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <main className={`${styles.main} gridBackground`}>
      < div className={styles.container}>
        <h1 className={styles.title}>MY PROFILE</h1>

        {!isLoggedIn ? (
          <div className={styles.viewContainer}>
            {view === 'login' && (
              <div className={styles.loginCard}>
                <p className={styles.loginSubtitle}>OkeyDoBokey 커뮤니티에 합류하세요</p>
                <form onSubmit={handleLogin} className={styles.formGroup}>
                  <input type="email" placeholder="이메일" className={styles.input} value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
                  <input type="password" placeholder="비밀번호" className={styles.input} value={loginPw} onChange={(e) => setLoginPw(e.target.value)} required />
                  {loginError && <p className={styles.errorMessage}>{loginError}</p>}
                  <button type="submit" className={styles.primaryBtn}>로그인</button>
                </form>

                <div className={styles.divider}>
                  <span>또는</span>
                </div>

                <div className={styles.socialLoginGroup}>
                  <button onClick={() => handleSocialLogin('google')} className={`${styles.socialBtn} ${styles.googleBtn}`}>
                    <svg className={styles.socialIcon} width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google로 시작하기
                  </button>
                  <button onClick={() => handleSocialLogin('kakao')} className={`${styles.socialBtn} ${styles.kakaoBtn}`}>
                    <svg className={styles.socialIcon} width="20" height="20" viewBox="0 0 24 24">
                      <path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.91 1.82 5.47 4.58 6.99L5.5 21.5l4.18-2.76c.76.12 1.54.18 2.32.18 5.52 0 10-3.69 10-8.25S17.52 3 12 3z" fill="#000" />
                    </svg>
                    카카오로 시작하기
                  </button>
                </div>

                <div className={styles.authLinks}>
                  <span onClick={() => setView('signup')} className={styles.authLink}>계정 생성하기</span>
                  <span className={styles.authDivider}>|</span>
                  <span onClick={() => setView('find')} className={styles.authLink}>아이디 / 비밀번호 찾기</span>
                </div>
              </div>
            )}

            {view === 'signup' && (
              <div className={styles.loginCard}>
                <p className={styles.loginSubtitle}>회원가입</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!verificationSent) {
                      handleSendVerification();
                    }
                  }}
                  className={styles.formGroup}
                >
                  <input type="text" placeholder="닉네임" className={styles.input} value={signupNickname} onChange={(e) => setSignupNickname(e.target.value)} disabled={verificationSent} required />
                  <input type="email" placeholder="이메일" className={styles.input} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={verificationSent} required />
                  <input type="password" placeholder="비밀번호" className={styles.input} value={signupPw} onChange={(e) => setSignupPw(e.target.value)} disabled={verificationSent} required />

                  <p style={{
                    fontSize: '0.78rem',
                    color: !isPwValid && signupPw ? '#ff4444' : '#888',
                    marginTop: '-0.3rem',
                    animation: !isPwValid && signupPw ? 'shake 0.4s ease' : 'none'
                  }}>
                    6자리 이상, 특수문자(!@#$%^&* 등) 포함
                  </p>

                  <input type="password" placeholder="비밀번호 확인" className={`${styles.input} ${signupConfirmPw && signupPw !== signupConfirmPw ? styles.inputError : ''}`} value={signupConfirmPw} onChange={(e) => setSignupConfirmPw(e.target.value)} disabled={verificationSent} required />

                  {signupConfirmPw && signupPw !== signupConfirmPw && (
                    <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
                  )}

                  {!verificationSent ? (
                    <button
                      type="submit"
                      className={styles.primaryBtn}
                      disabled={
                        !signupEmail.trim() ||
                        !signupPw.trim() ||
                        !signupConfirmPw.trim() ||
                        !signupNickname.trim() ||
                        signupPw !== signupConfirmPw || !isPwValid
                      }
                      style={{
                        opacity: (
                          signupEmail.trim() &&
                          signupPw.trim() &&
                          signupConfirmPw.trim() &&
                          signupNickname.trim() &&
                          signupPw === signupConfirmPw
                        ) ? 1 : 0.5,
                        cursor: (
                          signupEmail.trim() &&
                          signupPw.trim() &&
                          signupConfirmPw.trim() &&
                          signupNickname.trim() &&
                          signupPw === signupConfirmPw
                        ) ? 'pointer' : 'not-allowed'
                      }}
                    >
                      인증 메일 발송
                    </button>
                  ) : (
                    <>
                      <div className={styles.inputWithBtn} style={{ marginTop: '0.5rem' }}>
                        <input type="text" placeholder="6자리 인증코드 입력" className={styles.input} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
                        <button type="button" onClick={handleVerifyCode} className={styles.smallBtn}>인증 확인</button>
                      </div>
                      {verificationError && <p className={styles.errorMessage}>{verificationError}</p>}
                    </>
                  )}

                  {isEmailVerified && (
                    <button type="button" className={styles.primaryBtn} style={{ marginTop: '0.5rem' }}>
                      가입 완료
                    </button>
                  )}

                  {signupError && <p className={styles.errorMessage}>{signupError}</p>}
                </form>
                <div style={{ marginTop: '1.5rem' }}>
                  <span onClick={() => {
                    setView('login');
                    setSignupEmail('');
                    setSignupPw('');
                    setSignupConfirmPw('');
                    setSignupNickname('');
                    setSignupError('');
                    setVerificationSent(false);
                    setVerificationCode('');
                    setIsEmailVerified(false);
                  }} className={styles.authLink}>← 뒤로 가기</span>
                </div>
              </div>
            )}

            {view === 'find' && (
              <div className={styles.loginCard}>
                <p className={styles.loginSubtitle}>계정 정보 찾기</p>

                {/* 탭 구분 메뉴 */}
                <div className={styles.tabMenu}>
                  <button
                    type="button"
                    onClick={() => { setFindTab('id'); setFindError(''); setFindSuccessMessage(''); }}
                    className={`${styles.tabBtn} ${findTab === 'id' ? styles.activeTab : ''}`}
                  >
                    아이디 찾기
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFindTab('password'); setFindError(''); setFindSuccessMessage(''); }}
                    className={`${styles.tabBtn} ${findTab === 'password' ? styles.activeTab : ''}`}
                  >
                    비밀번호 찾기
                  </button>
                </div>

                {findTab === 'id' ? (
                  <form onSubmit={handleFindId} className={styles.formGroup}>
                    <input type="email" placeholder="가입 시 등록한 이메일" className={styles.input} value={findIdEmail} onChange={(e) => setFindIdEmail(e.target.value)} required />
                    {findError && <p className={styles.errorMessage}>{findError}</p>}
                    <button type="submit" className={styles.primaryBtn}>아이디 찾기</button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className={styles.formGroup}>
                    <input type="email" placeholder="가입 시 등록한 이메일" className={styles.input} value={findPwEmail} onChange={(e) => setFindPwEmail(e.target.value)} required />
                    {findError && <p className={styles.errorMessage}>{findError}</p>}
                    <button type="submit" className={styles.primaryBtn}>재설정 링크 발송</button>
                  </form>
                )}

                {findSuccessMessage && (
                  <div className={styles.findResult}>
                    <p style={{ color: '#03C75A', fontWeight: 600 }}>{findSuccessMessage}</p>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                  <span onClick={() => {
                    setView('login');
                    setFindIdEmail('');
                    setFindPwEmail('');
                    setFindSuccessMessage('');
                    setFindError('');
                  }} className={styles.authLink}>← 뒤로 가기</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.profileContent}>
            {view === 'changePassword' ? (
              <div className={styles.loginCard}>
                <p className={styles.loginSubtitle}>비밀번호 변경</p>
                <div className={styles.formGroup}>
                  <input
                    type="password"
                    placeholder="새 비밀번호"
                    className={styles.input}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="새 비밀번호 확인"
                    className={styles.input}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                  {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                  {passwordSuccess && <p style={{ color: '#03C75A', fontSize: '0.85rem' }}>{passwordSuccess}</p>}
                  <button onClick={handleUpdatePassword} className={styles.primaryBtn}>저장</button>
                  <button
                    type="button"
                    onClick={() => { setView('login'); setNewPassword(''); setConfirmNewPassword(''); setPasswordError(''); setPasswordSuccess(''); }}
                    className={styles.smallBtn}
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <section className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <h2>프로필 설정</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {supabaseUser?.app_metadata?.provider === 'email' && (
                        <span onClick={() => { setView('changePassword'); setPasswordError(''); setPasswordSuccess(''); }} className={styles.authLink}>비밀번호 변경</span>
                      )}
                      <button onClick={() => logout()} className={styles.logoutBtn}>로그아웃</button>
                    </div>
                  </div>
                  <div className={styles.profileRow}>
                    <div className={styles.avatar}><span>{currentNickname.charAt(0).toUpperCase()}</span></div>
                    <div className={styles.nameEdit}>
                      {!isEditingNickname ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                            <p className={styles.currentName} style={{ margin: 0 }}>현재 닉네임: <strong>{currentNickname}</strong></p>
                            <button onClick={() => { setIsEditingNickname(true); setNicknameError(''); setNicknameSuccess(''); }} className={styles.smallBtn}>닉네임 변경</button>
                          </div>
                          <p className={styles.emailText}>{currentEmail}</p>
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          <div className={styles.editForm}>
                            <input
                              type="text"
                              className={styles.input}
                              value={editNickname}
                              onChange={(e) => setEditNickname(e.target.value)}
                              placeholder="새 닉네임 입력"
                              required
                            />
                            <button onClick={handleUpdateNickname} className={styles.primaryBtn}>저장</button>
                            <button onClick={() => { setIsEditingNickname(false); setNicknameError(''); setNicknameSuccess(''); }} className={styles.smallBtn} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>취소</button>
                          </div>
                          {nicknameError && <p className={styles.errorMessage}>{nicknameError}</p>}
                          {nicknameSuccess && <p style={{ color: '#03C75A', fontSize: '0.85rem' }}>{nicknameSuccess}</p>}
                          <p className={styles.emailText}>{currentEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className={styles.sectionCard}>
                  <h2>나의 커뮤니티 활동</h2>
                  <div className={styles.activityGrid}>
                    <Link href="/profile/activity?tab=posts" className={styles.activityLinkCard}>
                      <div className={styles.activityCard}>
                        <h3>내가 쓴 글</h3>
                        <span className={styles.activityCount}>{activity.postCount}</span>
                      </div>
                    </Link>
                    <Link href="/profile/activity?tab=comments" className={styles.activityLinkCard}>
                      <div className={styles.activityCard}>
                        <h3>내가 쓴 댓글</h3>
                        <span className={styles.activityCount}>{activity.commentCount}</span>
                      </div>
                    </Link>
                    <Link href="/profile/activity?tab=likes" className={styles.activityLinkCard}>
                      <div className={styles.activityCard}>
                        <h3>좋아요 게시물</h3>
                        <span className={styles.activityCount}>{activity.likeCount}</span>
                      </div>
                    </Link>
                  </div>

                  <div className={styles.recentActivity}>
                    <h3>최근 작성한 글</h3>
                    <div className={styles.recentList}>
                      {activity.recentPosts.length > 0 ? (
                        activity.recentPosts.map((post: any) => (
                          <div key={post.id} className={styles.recentItem} onClick={() => router.push(`/community/${post.id}`)}>
                            <span className={styles.recentTitle}>{post.title}</span>
                            <span className={styles.recentDate}>{post.date}</span>
                          </div>
                        ))
                      ) : (
                        <p className={styles.noData}>최근 활동이 없습니다.</p>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </main >
  );
}
