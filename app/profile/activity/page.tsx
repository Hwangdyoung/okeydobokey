'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/ProfileActivity.module.css';
import { createClient } from '@/utils/supabase/client';

interface Reply {
  id: number;
  author: string;
  authorEmail: string;
  text: string;
  likes: number;
  date: string;
}

interface Comment {
  id: number;
  author: string;
  authorEmail: string;
  text: string;
  likes: number;
  likedBy?: string[];
  date: string;
  replies: Reply[];
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  date: string;
}

function ActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, currentEmail } = useAuth();
  const supabase = createClient();

  // URL tab 파라미터가 있으면 디폴트로 사용 (posts, comments, likes)
  const defaultTab = searchParams.get('tab') || 'posts';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [postsList, setPostsList] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 로컬 스토리지에서 모든 게시글 데이터를 최신 동기 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('posts')
          .select('*, comments(*)')
          .order('created_at', { ascending: false });
        if (data) setPostsList(data);
      } catch (e) {
        console.error('Failed to load posts:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 비로그인 또는 로딩 상태 제어
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--clr-accent)', fontSize: '1.5rem' }}>로딩 중...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '6rem 0' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--clr-gray-3)' }}>로그인이 필요한 서비스입니다.</p>
        <Link href="/profile" className={styles.backLink} style={{ color: 'var(--clr-accent)', textDecoration: 'underline' }}>
          로그인 페이지로 가기
        </Link>
      </div>
    );
  }

  // 1) 내가 쓴 글 필터링
  const myPosts = postsList.filter(post => post.authorEmail === currentEmail);

  // 2) 내가 쓴 댓글 필터링 (대댓글도 포함하여, 댓글이 속한 원문 게시글 정보와 함께 리스트화)
  const myComments: { commentId: number; text: string; date: string; postTitle: string; postId: number; isReply: boolean }[] = [];
  postsList.forEach(post => {
    const comments = Array.isArray(post.comments) ? post.comments : [];
    comments.forEach(c => {
      if (c.authorEmail === currentEmail) {
        myComments.push({
          commentId: c.id,
          text: c.text,
          date: c.date,
          postTitle: post.title,
          postId: post.id,
          isReply: false
        });
      }
      const replies = Array.isArray(c.replies) ? c.replies : [];
      replies.forEach(r => {
        if (r.authorEmail === currentEmail) {
          myComments.push({
            commentId: r.id,
            text: r.text,
            date: r.date,
            postTitle: post.title,
            postId: post.id,
            isReply: true
          });
        }
      });
    });
  });

  // 3) 좋아요 누른 글 필터링
  const likedPosts = postsList.filter(post => Array.isArray(post.likedBy) && post.likedBy.includes(currentEmail));

  return (
    <div className={styles.container}>
      <div className={styles.tabHeader}>
        <Link href="/profile" className={styles.backLink}>
          ← 프로필로 이동
        </Link>
        <span className={styles.divider}>|</span>
        <span className={styles.activeTab} style={{ borderBottom: 'none', padding: 0 }}>활동 내역</span>
      </div>

      <h1 className={styles.title}>MY ACTIVITY</h1>

      {/* 탭 버튼 그룹 */}
      <div className={styles.tabMenu}>
        <button
          onClick={() => setActiveTab('posts')}
          className={`${styles.tabBtn} ${activeTab === 'posts' ? styles.activeTab : ''}`}
        >
          내가 쓴 글 ({myPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`${styles.tabBtn} ${activeTab === 'comments' ? styles.activeTab : ''}`}
        >
          내가 쓴 댓글 ({myComments.length})
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`${styles.tabBtn} ${activeTab === 'likes' ? styles.activeTab : ''}`}
        >
          좋아요 누른 글 ({likedPosts.length})
        </button>
      </div>

      {/* 탭 내용 출력 */}
      <div className={styles.listContainer}>
        {activeTab === 'posts' && (
          myPosts.length > 0 ? (
            myPosts.map(post => (
              <div
                key={post.id}
                className={styles.activityCard}
                onClick={() => router.push(`/community/${post.id}`)}
              >
                <h2 className={styles.cardTitle}>{post.title}</h2>
                <div className={styles.cardMeta}>
                  <div className={styles.metaLeft}>
                    <span>👍 {post.likes}</span>
                    <span>💬 {(post.comments || []).length}</span>
                  </div>
                  <span>{post.date}</span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noData}>내가 작성한 게시물이 존재하지 않습니다.</div>
          )
        )}

        {activeTab === 'comments' && (
          myComments.length > 0 ? (
            myComments.map(comment => (
              <div
                key={comment.commentId}
                className={styles.activityCard}
                onClick={() => router.push(`/community/${comment.postId}`)}
              >
                <div className={styles.cardContext}>
                  원문 글: <span className={styles.contextValue}>{comment.postTitle}</span>
                  {comment.isReply && <span style={{ color: 'var(--clr-accent)', marginLeft: '0.5rem' }}>[답글]</span>}
                </div>
                <p className={styles.cardSnippet}>{comment.text}</p>
                <div className={styles.cardMeta} style={{ justifyContent: 'flex-end' }}>
                  <span>{comment.date}</span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noData}>내가 작성한 댓글이 존재하지 않습니다.</div>
          )
        )}

        {activeTab === 'likes' && (
          likedPosts.length > 0 ? (
            likedPosts.map(post => (
              <div
                key={post.id}
                className={styles.activityCard}
                onClick={() => router.push(`/community/${post.id}`)}
              >
                <h2 className={styles.cardTitle}>{post.title}</h2>
                <div className={styles.cardMeta}>
                  <div className={styles.metaLeft}>
                    <span>작성자: {post.author}</span>
                    <span>👍 {post.likes}</span>
                    <span>💬 {(post.comments || []).length}</span>
                  </div>
                  <span>{post.date}</span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noData}>좋아요를 누른 게시물이 존재하지 않습니다.</div>
          )
        )}
      </div>
    </div>
  );
}

export default function ProfileActivityPage() {
  return (
    <main className={`${styles.main} gridBackground`}>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--clr-accent)', fontSize: '1.5rem' }}>로딩 중...</div>}>
        <ActivityContent />
      </Suspense>
    </main>
  );
}
