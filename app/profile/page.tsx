'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { localUser, setLocalUser, isLoggedIn, logout, currentNickname, currentEmail } = useAuth();

  const [view, setView] = useState<'login' | 'signup' | 'find'>('login');
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  // 회원가입 관련 상태
  const [signupId, setSignupId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPw, setSignupPw] = useState('');
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
  const [findPwId, setFindPwId] = useState('');
  const [findPwEmail, setFindPwEmail] = useState('');
  const [findSuccessMessage, setFindSuccessMessage] = useState('');
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [findError, setFindError] = useState('');

  const [activity, setActivity] = useState({
    postCount: 0,
    commentCount: 0,
    likeCount: 0,
    recentPosts: [] as any[]
  });

  const getUsers = () => {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem('okeybokey_users');
    return users ? JSON.parse(users) : [];
  };

  const fetchActivity = async () => {
    if (!isLoggedIn || !currentEmail) return;

    try {
      const res = await fetch('/api/posts');
      const allPosts = await res.json();

      // 1. 내가 쓴 글
      const myPosts = allPosts.filter((p: any) => p.authorEmail === currentEmail);

      // 2. 내가 쓴 댓글 (대댓글 포함)
      let myCommentCount = 0;
      allPosts.forEach((p: any) => {
        if (p.comments) {
          p.comments.forEach((c: any) => {
            if (c.authorEmail === currentEmail) myCommentCount++;
            if (c.replies) {
              myCommentCount += c.replies.filter((r: any) => r.authorEmail === currentEmail).length;
            }
          });
        }
      });

      // 3. 좋아요 누른 게시글
      const likedPosts = allPosts.filter((p: any) => p.likedBy && p.likedBy.includes(currentEmail));

      setActivity({
        postCount: myPosts.length,
        commentCount: myCommentCount,
        likeCount: likedPosts.length,
        recentPosts: myPosts.slice(0, 3)
      });
    } catch (e) {
      console.error('Failed to fetch profile activity', e);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [isLoggedIn, currentEmail]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find((u: any) => u.id === loginId && u.password === loginPw);
    if (user) {
      setLocalUser(user);
    } else {
      setLoginError('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  // 이메일 인증 발송 핸들러
  const handleSendVerification = () => {
    if (!signupEmail) {
      alert('이메일 주소를 먼저 입력해 주세요.');
      return;
    }
    setVerificationSent(true);
    setIsEmailVerified(false);
    alert('인증번호 [1234]가 전송되었습니다. 테스트용 번호를 입력해 주세요.');
  };

  // 이메일 인증 확인 핸들러
  const handleVerifyCode = () => {
    if (verificationCode === '1234') {
      setIsEmailVerified(true);
      setVerificationError('');
      alert('이메일 인증이 성공적으로 완료되었습니다.');
    } else {
      setIsEmailVerified(false);
      setVerificationError('인증번호가 일치하지 않습니다. (테스트용: 1234)');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPw !== signupConfirmPw) {
      setSignupError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isEmailVerified) {
      setSignupError('이메일 인증을 완료해 주세요.');
      return;
    }

    const users = getUsers();
    
    // 아이디 중복 체크
    if (users.some((u: any) => u.id === signupId)) {
      setSignupError('이미 사용 중인 아이디입니다.');
      return;
    }
    // 이메일 중복 체크
    if (users.some((u: any) => u.email === signupEmail)) {
      setSignupError('이미 사용 중인 이메일입니다.');
      return;
    }

    const newUser = {
      id: signupId,
      email: signupEmail,
      password: signupPw,
      nickname: signupNickname,
      role: 'user'
    };

    localStorage.setItem('okeybokey_users', JSON.stringify([...users, newUser]));
    alert('회원가입이 완료되었습니다! 로그인해 주세요.');
    
    // 상태 초기화
    setSignupId('');
    setSignupEmail('');
    setSignupPw('');
    setSignupConfirmPw('');
    setSignupNickname('');
    setVerificationSent(false);
    setVerificationCode('');
    setIsEmailVerified(false);
    setSignupError('');
    setView('login');
  };

  // 아이디 찾기 핸들러
  const handleFindId = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find((u: any) => u.email === findIdEmail);
    
    if (user) {
      setFoundUser(user);
      setFindError('');
    } else {
      setFoundUser(null);
      setFindError('해당 이메일로 가입된 아이디를 찾을 수 없습니다.');
    }
  };

  // 비밀번호 재설정 핸들러
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find((u: any) => u.id === findPwId && u.email === findPwEmail);
    
    if (user) {
      setFindSuccessMessage('이메일로 비밀번호 재설정 링크가 성공적으로 발송되었습니다.');
      setFindError('');
    } else {
      setFindSuccessMessage('');
      setFindError('일치하는 회원 정보를 찾을 수 없습니다.');
    }
  };

  // 실제 NextAuth.js 소셜 로그인 함수 호출
  // * 안내: 로컬 개발 환경에서 테스트 시 반드시 .env.local에 GOOGLE/NAVER 자격 증명이 주입되어 있어야 하며, 
  //   터미널에 `npm install next-auth`가 설치되어 있어야 정상 연동됩니다.
  const handleSocialLogin = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: '/profile' });
    } catch (error) {
      console.error(`${provider} login failed`, error);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>MY PROFILE</h1>

        {!isLoggedIn ? (
          <div className={styles.viewContainer}>
            {view === 'login' && (
              <div className={styles.loginCard}>
                <p className={styles.loginSubtitle}>OkeyDoBokey 커뮤니티에 합류하세요</p>
                <form onSubmit={handleLogin} className={styles.formGroup}>
                  <input type="text" placeholder="아이디" className={styles.input} value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
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
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Google로 시작하기
                  </button>
                  <button onClick={() => handleSocialLogin('naver')} className={`${styles.socialBtn} ${styles.naverBtn}`}>
                    <svg className={styles.socialIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="4" fill="#03C75A"/>
                      <path d="M7 6.5H10.2L13.8 12.3V6.5H17V17.5H13.8L10.2 11.7V17.5H7V6.5Z" fill="white"/>
                    </svg>
                    Naver로 시작하기
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
                <form onSubmit={handleSignup} className={styles.formGroup}>
                  <input type="text" placeholder="아이디" className={styles.input} value={signupId} onChange={(e) => setSignupId(e.target.value)} required />
                  
                  {/* 이메일 인증 영역 */}
                  <div className={styles.inputWithBtn}>
                    <input type="email" placeholder="이메일" className={styles.input} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isEmailVerified} required />
                    <button type="button" onClick={handleSendVerification} className={styles.smallBtn} disabled={isEmailVerified}>
                      {isEmailVerified ? '인증 완료' : '인증번호 발송'}
                    </button>
                  </div>

                  {verificationSent && !isEmailVerified && (
                    <div className={styles.inputWithBtn}>
                      <input type="text" placeholder="인증번호 입력 (1234)" className={styles.input} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
                      <button type="button" onClick={handleVerifyCode} className={styles.smallBtn}>인증 확인</button>
                    </div>
                  )}

                  {verificationError && <p className={styles.errorMessage}>{verificationError}</p>}
                  {isEmailVerified && <p style={{ color: '#03C75A', fontSize: '0.85rem', textAlign: 'left' }}>이메일 인증이 완료되었습니다.</p>}

                  <input type="password" placeholder="비밀번호" className={styles.input} value={signupPw} onChange={(e) => setSignupPw(e.target.value)} required />
                  <input type="password" placeholder="비밀번호 확인" className={`${styles.input} ${signupConfirmPw && signupPw !== signupConfirmPw ? styles.inputError : ''}`} value={signupConfirmPw} onChange={(e) => setSignupConfirmPw(e.target.value)} required />
                  
                  {signupConfirmPw && signupPw !== signupConfirmPw && (
                    <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
                  )}

                  <input type="text" placeholder="닉네임" className={styles.input} value={signupNickname} onChange={(e) => setSignupNickname(e.target.value)} required />
                  
                  {signupError && <p className={styles.errorMessage}>{signupError}</p>}
                  
                  <button 
                    type="submit" 
                    className={styles.primaryBtn}
                    disabled={
                      !signupId.trim() ||
                      !signupEmail.trim() ||
                      !signupPw.trim() ||
                      !signupConfirmPw.trim() ||
                      !signupNickname.trim() ||
                      signupPw !== signupConfirmPw ||
                      !isEmailVerified
                    }
                    style={{
                      opacity: (
                        signupId.trim() &&
                        signupEmail.trim() &&
                        signupPw.trim() &&
                        signupConfirmPw.trim() &&
                        signupNickname.trim() &&
                        signupPw === signupConfirmPw &&
                        isEmailVerified
                      ) ? 1 : 0.5,
                      cursor: (
                        signupId.trim() &&
                        signupEmail.trim() &&
                        signupPw.trim() &&
                        signupConfirmPw.trim() &&
                        signupNickname.trim() &&
                        signupPw === signupConfirmPw &&
                        isEmailVerified
                      ) ? 'pointer' : 'not-allowed'
                    }}
                  >
                    가입하기
                  </button>
                </form>
                <div style={{ marginTop: '1.5rem' }}>
                  <span onClick={() => {
                    setView('login');
                    setSignupId('');
                    setSignupEmail('');
                    setSignupPw('');
                    setSignupConfirmPw('');
                    setSignupNickname('');
                    setVerificationSent(false);
                    setVerificationCode('');
                    setIsEmailVerified(false);
                    setSignupError('');
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
                    onClick={() => { setFindTab('id'); setFindError(''); setFoundUser(null); setFindSuccessMessage(''); }}
                    className={`${styles.tabBtn} ${findTab === 'id' ? styles.activeTab : ''}`}
                  >
                    아이디 찾기
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setFindTab('password'); setFindError(''); setFoundUser(null); setFindSuccessMessage(''); }}
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
                    <input type="text" placeholder="아이디" className={styles.input} value={findPwId} onChange={(e) => setFindPwId(e.target.value)} required />
                    <input type="email" placeholder="가입 시 등록한 이메일" className={styles.input} value={findPwEmail} onChange={(e) => setFindPwEmail(e.target.value)} required />
                    {findError && <p className={styles.errorMessage}>{findError}</p>}
                    <button type="submit" className={styles.primaryBtn}>재설정 링크 발송</button>
                  </form>
                )}

                {/* 결과 노출 */}
                {foundUser && (
                  <div className={styles.findResult}>
                    <p style={{ marginBottom: '0.5rem' }}>찾은 아이디: <strong className={styles.foundText}>{foundUser.id}</strong></p>
                    <p>비밀번호: <strong className={styles.foundText}>{foundUser.password}</strong></p>
                  </div>
                )}
                {findSuccessMessage && (
                  <div className={styles.findResult}>
                    <p style={{ color: '#03C75A', fontWeight: 600 }}>{findSuccessMessage}</p>
                  </div>
                )}

                <div style={{ marginTop: '1.5rem' }}>
                  <span onClick={() => { 
                    setView('login'); 
                    setFoundUser(null); 
                    setFindIdEmail(''); 
                    setFindPwId(''); 
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
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2>프로필 설정</h2>
                <button onClick={() => logout()} className={styles.logoutBtn}>로그아웃</button>
              </div>
              <div className={styles.profileRow}>
                <div className={styles.avatar}><span>{currentNickname.charAt(0).toUpperCase()}</span></div>
                <div className={styles.nameEdit}>
                  <p className={styles.currentName}>현재 닉네임: <strong>{currentNickname}</strong></p>
                  <p className={styles.emailText}>{currentEmail}</p>
                </div>
              </div>
            </section>

            <section className={styles.sectionCard}>
              <h2>나의 커뮤니티 활동</h2>
              <div className={styles.activityGrid}>
                <div className={styles.activityCard}>
                  <h3>내가 쓴 글</h3>
                  <span className={styles.activityCount}>{activity.postCount}</span>
                </div>
                <div className={styles.activityCard}>
                  <h3>내가 쓴 댓글</h3>
                  <span className={styles.activityCount}>{activity.commentCount}</span>
                </div>
                <div className={styles.activityCard}>
                  <h3>좋아요 게시물</h3>
                  <span className={styles.activityCount}>{activity.likeCount}</span>
                </div>
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
          </div>
        )}
      </div>
    </main>
  );
}
