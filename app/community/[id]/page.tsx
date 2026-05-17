'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/PostDetail.module.css';

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

import BackButton from '@/components/BackButton';

export default function PostDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { isLoggedIn, currentNickname, currentEmail } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchPost = () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('okeybokey_posts');
      if (stored) {
        const postsList: Post[] = JSON.parse(stored);
        const found = postsList.find(p => String(p.id) === String(id));
        setPost(found || null);
      } else {
        setPost(null);
      }
    } catch (e) {
      console.error('Failed to fetch post from localStorage:', e);
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleLikePost = () => {
    if (!isLoggedIn) return router.push('/profile');
    if (!post) return;

    const currentLikedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    const hasLiked = currentLikedBy.includes(currentEmail);
    const newLikedBy = hasLiked 
      ? currentLikedBy.filter(email => email !== currentEmail)
      : [...currentLikedBy, currentEmail];

    try {
      const stored = localStorage.getItem('okeybokey_posts');
      const postsList: Post[] = stored ? JSON.parse(stored) : [];
      const postIndex = postsList.findIndex(p => String(p.id) === String(id));
      
      if (postIndex !== -1) {
        const updatedPost = { 
          ...postsList[postIndex], 
          likedBy: newLikedBy, 
          likes: newLikedBy.length 
        };
        postsList[postIndex] = updatedPost;
        localStorage.setItem('okeybokey_posts', JSON.stringify(postsList));
        setPost(updatedPost);
      }
    } catch (e) {
      console.error('Failed to like post in localStorage:', e);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return router.push('/profile');
    if (!commentText.trim() || !post) return;

    const newComment: Comment = {
      id: Date.now(),
      author: currentNickname,
      authorEmail: currentEmail,
      text: commentText,
      likes: 0,
      date: new Date().toISOString().split('T')[0],
      replies: []
    };

    try {
      const stored = localStorage.getItem('okeybokey_posts');
      const postsList: Post[] = stored ? JSON.parse(stored) : [];
      const postIndex = postsList.findIndex(p => String(p.id) === String(id));
      
      if (postIndex !== -1) {
        const currentComments = Array.isArray(postsList[postIndex].comments) 
          ? postsList[postIndex].comments 
          : [];
        const updatedPost = { 
          ...postsList[postIndex], 
          comments: [...currentComments, newComment] 
        };
        postsList[postIndex] = updatedPost;
        localStorage.setItem('okeybokey_posts', JSON.stringify(postsList));
        setPost(updatedPost);
        setCommentText('');
      }
    } catch (e) {
      console.error('Failed to add comment in localStorage:', e);
    }
  };

  const handleReplySubmit = (commentId: number) => {
    if (!isLoggedIn) return router.push('/profile');
    if (!replyText.trim() || !post) return;

    const newReply: Reply = {
      id: Date.now(),
      author: currentNickname,
      authorEmail: currentEmail,
      text: replyText,
      likes: 0,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const stored = localStorage.getItem('okeybokey_posts');
      const postsList: Post[] = stored ? JSON.parse(stored) : [];
      const postIndex = postsList.findIndex(p => String(p.id) === String(id));
      
      if (postIndex !== -1) {
        const currentComments = Array.isArray(postsList[postIndex].comments) 
          ? postsList[postIndex].comments 
          : [];
        const updatedComments = currentComments.map(c => {
          if (c.id === commentId) {
            const currentReplies = Array.isArray(c.replies) ? c.replies : [];
            return { ...c, replies: [...currentReplies, newReply] };
          }
          return c;
        });

        const updatedPost = { 
          ...postsList[postIndex], 
          comments: updatedComments 
        };
        postsList[postIndex] = updatedPost;
        localStorage.setItem('okeybokey_posts', JSON.stringify(postsList));
        setPost(updatedPost);
        setReplyText('');
        setReplyTarget(null);
      }
    } catch (e) {
      console.error('Failed to add reply in localStorage:', e);
    }
  };

  const handleLikeComment = (commentId: number) => {
    if (!isLoggedIn) return router.push('/profile');
    if (!post) return;

    try {
      const stored = localStorage.getItem('okeybokey_posts');
      const postsList: Post[] = stored ? JSON.parse(stored) : [];
      const postIndex = postsList.findIndex(p => String(p.id) === String(id));
      
      if (postIndex !== -1) {
        const currentComments = Array.isArray(postsList[postIndex].comments) 
          ? postsList[postIndex].comments 
          : [];
        const updatedComments = currentComments.map(c => {
          if (c.id === commentId) {
            return { ...c, likes: (c.likes || 0) + 1 };
          }
          return c;
        });

        const updatedPost = { 
          ...postsList[postIndex], 
          comments: updatedComments 
        };
        postsList[postIndex] = updatedPost;
        localStorage.setItem('okeybokey_posts', JSON.stringify(postsList));
        setPost(updatedPost);
      }
    } catch (e) {
      console.error('Failed to like comment in localStorage:', e);
    }
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
  
  if (!post) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.tabMenu}>
            <Link href="/community" className={styles.backLink}>
              ← 뒤로 가기
            </Link>
            <span className={styles.divider}>|</span>
            <span className={styles.activeTab}>오류</span>
          </div>
          <div className={styles.noData} style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--clr-gray-3)' }}>존재하지 않거나 삭제된 게시글입니다.</p>
            <Link href="/community" className={styles.submitBtn} style={{ display: 'inline-block', textDecoration: 'none' }}>
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 안전한 배열 보장
  const safeComments = post && Array.isArray(post.comments) ? post.comments : [];

  // 베스트 댓글 추출 시 safeComments 사용
  const bestComment = [...safeComments]
    .filter(c => (c.likes || 0) > 0)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
  
  const bestCommentId = bestComment?.id;

  const sortedComments = [...safeComments].sort((a, b) => {
    if (a.id === bestCommentId) return -1;
    if (b.id === bestCommentId) return 1;
    return 0;
  });

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.tabMenu}>
          <Link href="/community" className={styles.backLink}>
            ← 뒤로 가기
          </Link>
          <span className={styles.divider}>|</span>
          <span className={styles.activeTab}>게시글 상세</span>
        </div>
        
        <article className={styles.postArea}>
          <header className={styles.postHeader}>
            <h1 className={styles.postTitle}>{post?.title}</h1>
            <div className={styles.postMeta}>
              <span>작성자: {post?.author}</span>
              <span>{post?.date}</span>
            </div>
          </header>
          
          <div className={styles.postContent}>
            {(post?.content || '').split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
          
          <div className={styles.postActions}>
            <button 
              className={`${styles.likeBtn} ${(post?.likedBy || []).includes(currentEmail) ? styles.liked : ''}`}
              onClick={handleLikePost}
            >
              👍 {post?.likes || 0}
            </button>
          </div>
        </article>

        <section className={styles.commentSection}>
          <h2 className={styles.sectionTitle}>댓글 {safeComments.length}</h2>
          
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인이 필요합니다."}
              disabled={!isLoggedIn}
              className={styles.textarea}
            />
            <button type="submit" className={styles.submitBtn} disabled={!isLoggedIn}>등록</button>
          </form>
 
          <div className={styles.commentList}>
            {sortedComments.map(comment => {
              const safeReplies = Array.isArray(comment.replies) ? comment.replies : [];
              return (
                <div 
                  key={comment.id} 
                  className={`${styles.commentItem} ${comment.id === bestCommentId ? styles.bestComment : ''}`}
                >
                  {comment.id === bestCommentId && <span className={styles.bestBadge}>🔥 BEST</span>}
                  <div className={styles.commentHeader}>
                    <span className={styles.commentAuthor}>{comment.author}</span>
                    <span className={styles.commentDate}>{comment.date}</span>
                  </div>
                  <p className={styles.commentText}>{comment.text}</p>
                  
                  <div className={styles.commentActions}>
                    <button className={styles.actionBtn} onClick={() => handleLikeComment(comment.id)}>
                      ♥ {comment.likes}
                    </button>
                    <button className={styles.actionBtn} onClick={() => setReplyTarget(replyTarget === comment.id ? null : comment.id)}>
                      답글 달기
                    </button>
                  </div>
 
                  {/* 대댓글 리스트 */}
                  {safeReplies.length > 0 && (
                    <div className={styles.replyList}>
                      {safeReplies.map(reply => (
                        <div key={reply.id} className={styles.replyItem}>
                          <div className={styles.replyHeader}>
                            <span className={styles.replyAuthor}>└ {reply.author}</span>
                            <span className={styles.replyDate}>{reply.date}</span>
                          </div>
                          <p className={styles.replyText}>{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                {/* 대댓글 입력폼 */}
                {replyTarget === comment.id && (
                  <div className={styles.replyForm}>
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답글을 입력하세요..."
                      className={styles.textareaSmall}
                    />
                    <div className={styles.replyActions}>
                      <button onClick={() => handleReplySubmit(comment.id)} className={styles.submitBtnSmall}>등록</button>
                      <button onClick={() => setReplyTarget(null)} className={styles.cancelBtnSmall}>취소</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </section>
      </div>
    </main>
  );
}
