'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import styles from '@/styles/Community.module.css';
import BackButton from '@/components/BackButton';

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

export default function CommunityPage() {
  const router = useRouter();
  const { isLoggedIn, currentNickname, currentEmail } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'notice' | 'all' | 'hot' | 'review' | 'my'>('all');
  const [isWriting, setIsWriting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiphopIssues, setHiphopIssues] = useState<any[]>([]);
  const [isIssuesLoading, setIsIssuesLoading] = useState(true);

  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('general');

  // 실시간 힙합 뉴스 연동 데이터 패칭
  useEffect(() => {
    const fetchNews = async () => {
      setIsIssuesLoading(true);
      try {
        const res = await fetch('/api/issues');
        if (res.ok) {
          const data = await res.json();
          setHiphopIssues(data);
        } else {
          setHiphopIssues(MOCK_ISSUES);
        }
      } catch (error) {
        console.error('실시간 이슈를 불러오는 도중 오류 발생:', error);
        setHiphopIssues(MOCK_ISSUES);
      } finally {
        setIsIssuesLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Supabase에서 게시글 불러오기
  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        author: p.author,
        authorEmail: p.author_email,
        category: p.category,
        likes: p.likes ?? 0,
        likedBy: p.liked_by ?? [],
        comments: p.comments ?? [],
        date: p.date,
      })));
    } else if (error) {
      console.error('게시글 불러오기 실패:', error.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 게시글 작성
  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeTitle.trim() || !writeContent.trim()) return;

    const { error } = await supabase.from('posts').insert({
      title: writeTitle,
      content: writeContent,
      category: writeCategory,
      author: currentNickname,
      author_email: currentEmail,
      date: new Date().toISOString().split('T')[0],
    });

    if (!error) {
      setWriteTitle('');
      setWriteContent('');
      setIsWriting(false);
      setActiveTab('all');
      fetchPosts();
      alert('게시글이 작성되었습니다.');
    } else {
      console.error('게시글 작성 실패:', error.message);
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
              <button
                className={styles.writeBtn}
                onClick={() => isLoggedIn ? setIsWriting(true) : router.push('/profile')}
              >
                게시글 작성
              </button>
            )}
          </div>

          {isWriting ? (
            <div className={styles.writeFormWrapper}>
              <div className={styles.tabMenu} style={{ marginBottom: '2rem' }}>
                <Link
                  href="/community"
                  className={styles.backLink}
                  onClick={(e) => { e.preventDefault(); setIsWriting(false); }}
                >
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
                  placeholder={`※ 정치·사회 관련 행위 금지\n- 국가기관, 정치 관련 단체, 언론, 시민단체에 대한 언급 혹은 이와 관련한 행위\n\n※ 홍보 및 판매 관련 행위 금지\n- 영리 여부와 관계 없이 사업체·기관·단체·개인에게 직간접적으로 영향을 줄 수 있는 게시물 작성 행위\n\n※ 그 밖의 규칙 위반\n- 타인의 권리를 침해하거나 불쾌감을 주는 행위\n- 욕설, 비하, 차별, 혐오 관련 내용을 포함한 게시물 작성 행위`}
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
                            <h3 className={styles.postTitle}>{post.title}</h3>
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
            {isIssuesLoading ? (
              <div className={styles.issueSkeleton}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className={styles.skeletonItem}>
                    <div className={styles.skeletonIndex} />
                    <div className={styles.skeletonTextContainer}>
                      <div className={styles.skeletonText} style={{ width: num % 2 === 0 ? '85%' : '95%' }} />
                      <div className={styles.skeletonSource} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className={styles.issueList}>
                {hiphopIssues.map((issue, idx) => (
                  <li key={issue.id}>
                    <a href={issue.url} target="_blank" rel="noopener noreferrer" className={styles.issueItem}>
                      <span className={styles.issueIndex}>{idx + 1}.</span>
                      <div className={styles.issueContent}>
                        <span className={styles.issueText} title={issue.title}>{issue.title}</span>
                        <span className={styles.issueSource}>{issue.source}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
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
