'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/Community.module.css';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  category: string;
  likes: number;
  likedBy: string[];
  comments: any[];
  date: string;
}

// [실시간 뉴스 연동을 위한 Mock 데이터]
const MOCK_ISSUES = [
  { 
    id: 1,
    title: "힙합플레이야 페스티벌 2026, 2만5천 관객과 만든 현장… VVD 12년만 재결합", 
    source: "톱스타뉴스",
    url: "https://www.topstarnews.co.kr" 
  },
  { 
    id: 2,
    title: "양홍원 \"5월 2일에 보자\"… 빅나티·김감전 디스전 여파 속 힙플페 무대 주목", 
    source: "이슈/연예",
    url: "https://news.naver.com" 
  },
  { 
    id: 3,
    title: "바비, '힙플페 2026'서 압도적 무대 장악… '쇼미'에서 보여준 존재감 여전", 
    source: "세계일보",
    url: "https://www.segye.com" 
  },
  { 
    id: 4,
    title: "박재범·이센스 미공개곡 최초 공개… 릴 모쉬핏X식케이 합작 파트2 예고", 
    source: "음악/트렌드",
    url: "https://news.naver.com" 
  }
];

import BackButton from '@/components/BackButton';

export default function CommunityPage() {
  const router = useRouter();
  const { isLoggedIn, currentNickname, currentEmail } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'notice' | 'all' | 'hot' | 'review' | 'my'>('all');
  const [isWriting, setIsWriting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiphopIssues, setHiphopIssues] = useState<any[]>([]);

  // 힙합 뉴스 데이터 패칭 (실시간 연동 대비 구조)
  useEffect(() => {
    // TODO: 실제 네이버 뉴스 API 또는 RSS 피드 엔드포인트 연동 예정
    const fetchNews = async () => {
      setTimeout(() => {
        setHiphopIssues(MOCK_ISSUES);
      }, 500);
    };
    fetchNews();
  }, []);

  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('general');

  const fetchPosts = () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('okeybokey_posts');
      if (stored) {
        setPosts(JSON.parse(stored));
      } else {
        const initialPosts: Post[] = [
          { 
            id: 1716382103323, 
            title: '[공지] OkeyBokey 커뮤니티 이용 가이드라인', 
            content: '회원 여러분, 힙합 문화를 사랑하는 공간인 만큼 서로를 존중해 주세요...', 
            author: '운영자', 
            authorEmail: 'admin@okeybokey.com', 
            category: 'notice',
            likes: 50, 
            likedBy: [],
            comments: [],
            date: '2026-05-01' 
          },
          { 
            id: 1716382103324, 
            title: '이번 코첼라 라인업 보셨나요?', 
            content: '진짜 역대급이네요. 꼭 가고 싶습니다.', 
            author: '힙합은나의빛', 
            authorEmail: 'hiphop@test.com', 
            category: 'general',
            likes: 12, 
            likedBy: ['test@test.com'],
            comments: [
              { 
                id: 101, 
                author: 'Default_Rapper', 
                authorEmail: 'test@test.com', 
                text: 'ㄹㅇㅋㅋ 가고싶네요', 
                likes: 5,
                date: '2026-05-14',
                replies: [
                  { id: 201, author: '힙합은나의빛', authorEmail: 'hiphop@test.com', text: '그쵸? 같이 가요!', likes: 2, date: '2026-05-14' }
                ]
              }
            ],
            date: '2026-05-14' 
          }
        ];
        localStorage.setItem('okeybokey_posts', JSON.stringify(initialPosts));
        setPosts(initialPosts);
      }
    } catch (e) {
      console.error('Failed to fetch posts from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeTitle.trim() || !writeContent.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      title: writeTitle,
      content: writeContent,
      category: writeCategory,
      author: currentNickname,
      authorEmail: currentEmail,
      likes: 0,
      likedBy: [],
      comments: [],
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const stored = localStorage.getItem('okeybokey_posts');
      const currentPosts = stored ? JSON.parse(stored) : [];
      const updatedPosts = [newPost, ...currentPosts];
      localStorage.setItem('okeybokey_posts', JSON.stringify(updatedPosts));
      
      setWriteTitle('');
      setWriteContent('');
      setIsWriting(false);
      setActiveTab('all');
      fetchPosts();
      alert('게시글이 작성되었습니다.');
    } catch (e) {
      alert('게시글 작성에 실패했습니다.');
    }
  };

  const getFilteredPosts = () => {
    if (activeTab === 'hot') return posts.filter(post => (post.likes || 0) >= 10);
    if (activeTab === 'my') {
      if (!isLoggedIn) return [];
      return posts.filter(post => post.authorEmail === currentEmail);
    }
    if (activeTab === 'all') return posts;
    return posts.filter(post => post.category === activeTab);
  };

  const filteredPosts = getFilteredPosts();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        
        {/* ====== 중앙 메인 영역 (게시판) ====== */}
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>COMMUNITY</h1>
            {!isWriting && (
              <button className={styles.writeBtn} onClick={() => isLoggedIn ? setIsWriting(true) : router.push('/profile')}>
                게시글 작성
              </button>
            )}
          </div>

          {isWriting ? (
            <div className={styles.writeFormWrapper}>
              <div className={styles.tabMenu} style={{ marginBottom: '2rem' }}>
                <Link href="/community" className={styles.backLink} onClick={(e) => { e.preventDefault(); setIsWriting(false); }}>
                  ← 뒤로 가기
                </Link>
                <span className={styles.divider}>|</span>
                <span className={`${styles.tabBtn} ${styles.activeTab}`}>게시글 작성</span>
              </div>
              <form onSubmit={handleWriteSubmit} className={styles.formGroup}>
                <div className={styles.categorySelect}>
                  <label>카테고리: </label>
                  <select value={writeCategory} onChange={(e) => setWriteCategory(e.target.value)}>
                    <option value="general">일반</option>
                    <option value="review">후기</option>
                  </select>
                </div>
                <input 
                  type="text" 
                  placeholder="제목을 입력하세요" 
                  className={styles.input}
                  value={writeTitle}
                  onChange={(e) => setWriteTitle(e.target.value)}
                  required
                />
                <textarea 
                  placeholder={`※ 정치·사회 관련 행위 금지
- 국가기관, 정치 관련 단체, 언론, 시민단체에 대한 언급 혹은 이와 관련한 행위
- 정책·외교 또는 정치·정파에 대한 의견, 주장 및 이념, 가치관을 드러내는 행위
- 성별, 종교, 인종, 출신, 지역, 직업, 이념 등 사회적 이슈에 대한 언급 혹은 이와 관련한 행위
- 위와 같은 내용으로 유추될 수 있는 비유, 은어 사용 행위

※ 홍보 및 판매 관련 행위 금지
- 영리 여부와 관계 없이 사업체·기관·단체·개인에게 직간접적으로 영향을 줄 수 있는 게시물 작성 행위
- 위와 관련된 것으로 의심되거나 예상될 수 있는 바이럴 홍보 및 명칭·단어 언급 행위

※ 불법촬영물 유통 금지
불법촬영물등을 게재할 경우 「전기통신사업법」 제22조의5에 의거하여, 「성폭력범죄의 처벌 등에 관한 특례법」 제14조 등 관련 법률에 따라 삭제 조치 및 서비스 이용이 영구적으로 제한될 수 있으며 관련 법률에 기반하여 처벌받을 수 있습니다.

※ 그 밖의 규칙 위반
- 타인의 권리를 침해하거나 불쾌감을 주는 행위
- 범죄, 불법 행위 등 법령을 위반하는 행위
- 욕설, 비하, 차별, 혐오, 자살, 폭력 관련 내용을 포함한 게시물 작성 행위
- 음란물, 성적 수치심을 유발하는 행위
- 스포일러, 공포, 속임, 놀라게 하는 행위`}
                  className={`${styles.input} ${styles.textarea}`}
                  value={writeContent}
                  onChange={(e) => setWriteContent(e.target.value)}
                  required
                />
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setIsWriting(false)}>취소</button>
                  <button type="submit" className={styles.submitBtn}>등록</button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className={styles.tabMenu}>
                <button className={`${styles.tabBtn} ${activeTab === 'notice' ? styles.activeTab : ''}`} onClick={() => setActiveTab('notice')}>공지사항</button>
                <button className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`} onClick={() => setActiveTab('all')}>전체글</button>
                <button className={`${styles.tabBtn} ${activeTab === 'hot' ? styles.activeTab : ''}`} onClick={() => setActiveTab('hot')}>핫 게시판🔥</button>
                <button className={`${styles.tabBtn} ${activeTab === 'review' ? styles.activeTab : ''}`} onClick={() => setActiveTab('review')}>후기</button>
                <button className={`${styles.tabBtn} ${activeTab === 'my' ? styles.activeTab : ''}`} onClick={() => isLoggedIn ? setActiveTab('my') : router.push('/profile')}>내가 쓴 글</button>
              </div>

              {isLoading ? (
                <div className={styles.noData}>로딩 중...</div>
              ) : (
                <div className={styles.listContainer}>
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                      <Link href={`/community/${post.id}`} key={post.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div className={styles.postCard}>
                          <div className={styles.postHeader}>
                            {post.category === 'notice' && <span className={styles.noticeBadge}>[공지]</span>}
                            <h3 className={styles.postTitle}>
                              {post.title}
                            </h3>
                            {(post.likes || 0) >= 10 && <span className={styles.hotIcon}>🔥</span>}
                          </div>
                          <p className={styles.postContent}>{post.content}</p>
                          <div className={styles.postFooter}>
                            <div className={styles.postMeta}>
                              <span>작성자: {post.author}</span>
                              <span>{post.date}</span>
                            </div>
                            <div className={styles.postStats}>
                              <span>👍 {post.likes || 0}</span>
                              <span>💬 {(post.comments || []).length}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className={styles.noData}>해당 카테고리에 게시글이 없습니다.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ====== 우측 스티키 사이드바 ====== */}
        <aside className={styles.sidebar}>
          {/* HIPHOP ISSUE 섹션 */}
          <section className={styles.issueCard}>
            <h2 className={styles.sidebarTitle}>HIPHOP ISSUE 📰</h2>
            <ul className={styles.issueList}>
              {hiphopIssues.map((issue, idx) => (
                <li key={issue.id}>
                  <a href={issue.url} target="_blank" rel="noopener noreferrer" className={styles.issueItem}>
                    <span className={styles.issueIndex}>{idx + 1}.</span>
                    <div className={styles.issueContent}>
                      <span className={styles.issueText}>{issue.title}</span>
                      <span className={styles.issueSource}>{issue.source}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* HOT VIDEO 섹션 */}
          <section className={styles.videoCard}>
            <h2 className={styles.sidebarTitle}>HOT VIDEO 🔥</h2>
            <div className={styles.videoWrapper}>
              <iframe 
                src="https://www.youtube.com/embed/Rd3G2PjYjbo" 
                title="HOT VIDEO"
                allowFullScreen
              />
            </div>
            <p className={styles.videoDesc}>
              김감전, 리치이기, 킴보 - 빅나티를 변기에 넣고서 내려
            </p>
          </section>
        </aside>

      </div>
    </main>
  );
}
