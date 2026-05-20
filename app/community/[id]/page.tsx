'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import styles from '@/styles/PostDetail.module.css';
import BackButton from '@/components/BackButton';

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

export default function PostDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { isLoggedIn, currentNickname, currentEmail } = useAuth();
  const supabase = createClient();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchPost = async () => {
    if (!id) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .eq('id', id)
      .single();

    if (!error && data) {
      const mapped: Post = {
        id: data.id,
        title: data.title,
        content: data.content,
        author: data.author,
        authorEmail: data.author_email,
        likes: data.likes ?? 0,
        likedBy: data.liked_by ?? [],
        comments: (data.comments ?? []).map((c: any) => ({
          id: c.id,
          author: c.author,
          authorEmail: c.author_email,
          text: c.text,
          likes: c.likes ?? 0,
          likedBy: c.liked_by ?? [],
          date: c.date,
          replies: [],
        })),
        date: data.date,
      };
      setPost(mapped);
      setEditTitle(mapped.title);
      setEditContent(mapped.content);
    } else {
      setPost(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  // 게시글 좋아요
  const handleLikePost = async () => {
    if (!isLoggedIn) return router.push('/profile');
    if (!post) return;

    const hasLiked = post.likedBy.includes(currentEmail);
    const newLikedBy = hasLiked
      ? post.likedBy.filter(e => e !== currentEmail)
      : [...post.likedBy, currentEmail];

    const { error } = await supabase
      .from('posts')
      .update({ liked_by: newLikedBy, likes: newLikedBy.length })
      .eq('id', post.id);

    if (!error) {
      setPost({ ...post, likedBy: newLikedBy, likes: newLikedBy.length });
    }
  };

  // 게시글 수정
  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim() || !post) return;

    const { error } = await supabase
      .from('posts')
      .update({ title: editTitle, content: editContent })
      .eq('id', post.id);

    if (!error) {
      setPost({ ...post, title: editTitle, content: editContent });
      setIsEditMode(false);
      alert('게시글이 성공적으로 수정되었습니다.');
    } else {
      alert('수정에 실패했습니다.');
    }
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!post) return;
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id);

    if (!error) {
      alert('게시글이 삭제되었습니다.');
      router.push('/community');
    } else {
      alert('삭제에 실패했습니다.');
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return router.push('/profile');
    if (!commentText.trim() || !post) return;

    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      author: currentNickname,
      author_email: currentEmail,
      text: commentText,
      date: new Date().toISOString().split('T')[0],
    });

    if (!error) {
      setCommentText('');
      fetchPost();
    } else {
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 대댓글 작성
  const handleReplySubmit = async (commentId: number) => {
    if (!isLoggedIn) return router.push('/profile');
    if (!replyText.trim() || !post) return;

    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      parent_id: commentId,
      author: currentNickname,
      author_email: currentEmail,
      text: replyText,
      date: new Date().toISOString().split('T')[0],
    });

    if (!error) {
      setReplyText('');
      setReplyTarget(null);
      fetchPost();
    } else {
      alert('답글 작성에 실패했습니다.');
    }
  };

  // 댓글 좋아요
  const handleLikeComment = async (commentId: number) => {
    if (!isLoggedIn) return router.push('/profile');
    if (!post) return;

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return;

    const currentLikedBy = Array.isArray(comment.likedBy) ? comment.likedBy : [];
    const hasLiked = currentLikedBy.includes(currentEmail);
    const newLikedBy = hasLiked
      ? currentLikedBy.filter(e => e !== currentEmail)
      : [...currentLikedBy, currentEmail];

    const { error } = await supabase
      .from('comments')
      .update({ liked_by: newLikedBy, likes: newLikedBy.length })
      .eq('id', commentId);

    if (!error) {
      setPost({
        ...post,
        comments: post.comments.map(c =>
          c.id === commentId ? { ...c, likedBy: newLikedBy, likes: newLikedBy.length } : c
        ),
      });
    }
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;

  if (!post) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.tabMenu}>
            <Link href="/community" className={styles.backLink}>← 뒤로 가기</Link>
            <span className={styles.divider}>|</span>
            <span className={styles.activeTab}>오류</span>
          </div>
          <div className={styles.noData} style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--clr-gray-3)' }}>
              존재하지 않거나 삭제된 게시글입니다.
            </p>
            <Link href="/community" className={styles.submitBtn} style={{ display: 'inline-block', textDecoration: 'none' }}>
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const safeComments = post.comments.filter(c => !c.id.toString().startsWith('reply'));
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
          <Link href="/community" className={styles.backLink}>← 뒤로 가기</Link>
          <span className={styles.divider}>|</span>
          <span className={styles.activeTab}>게시글 상세</span>
        </div>

        <article className={styles.postArea}>
          {isEditMode ? (
            <div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={styles.editInput}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={styles.editTextarea}
              />
              <div className={styles.editActionGroup}>
                <button onClick={handleSaveEdit} className={styles.saveBtn}>저장</button>
                <button onClick={() => { setIsEditMode(false); setEditTitle(post.title); setEditContent(post.content); }} className={styles.cancelBtn}>취소</button>
              </div>
            </div>
          ) : (
            <>
              <header className={styles.postHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 className={styles.postTitle}>{post.title}</h1>
                  <div className={styles.postMeta}>
                    <span>작성자: {post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
                {isLoggedIn && (post.authorEmail === currentEmail || post.author === currentNickname) && (
                  <div className={styles.postCtrlGroup}>
                    <button onClick={() => setIsEditMode(true)} className={styles.editBtn}>수정</button>
                    <button onClick={handleDeletePost} className={styles.deleteBtn}>삭제</button>
                  </div>
                )}
              </header>

              <div className={styles.postContent}>
                {post.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>

              <div className={styles.postActions}>
                <button
                  className={`${styles.likeBtn} ${post.likedBy.includes(currentEmail) ? styles.liked : ''}`}
                  onClick={handleLikePost}
                >
                  👍 {post.likes || 0}
                </button>
              </div>
            </>
          )}
        </article>

        <section className={styles.commentSection}>
          <h2 className={styles.sectionTitle}>댓글 {safeComments.length}</h2>

          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={isLoggedIn ? '댓글을 입력하세요...' : '로그인이 필요합니다.'}
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
                    <button
                      className={`${styles.actionBtn} ${(comment.likedBy || []).includes(currentEmail) ? styles.likedComment : ''}`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      ♥ {comment.likes}
                    </button>
                    <button className={styles.actionBtn} onClick={() => setReplyTarget(replyTarget === comment.id ? null : comment.id)}>
                      답글 달기
                    </button>
                  </div>

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
