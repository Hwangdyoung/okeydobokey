'use client';

import { useState } from 'react';
import styles from '@/styles/Recommend.module.css';

type PlaylistKey = 'trap_hype' | 'trap_sad' | 'trap_melodic' | 'drill_dark' | 'rnb_smooth' | 'rnb_chill' | 'boombap_lyrical';

interface Option {
  text: string;
  scores: Partial<Record<PlaylistKey, number>>;
}

interface Question {
  id: number;
  title: string;
  options: Option[];
}

const questions: Question[] = [
  {
    id: 1,
    title: '지금 기분이 어때?',
    options: [
      { text: '신나고 에너지 넘침', scores: { trap_hype: 3, drill_dark: 2, trap_melodic: 1 } },
      { text: '감성적이고 쓸쓸함', scores: { trap_sad: 3, rnb_smooth: 2, boombap_lyrical: 1 } },
      { text: '뭔가 화가 남', scores: { drill_dark: 3, boombap_lyrical: 2, trap_hype: 1 } },
      { text: '여유롭고 편안함', scores: { rnb_chill: 3, rnb_smooth: 2, trap_melodic: 1 } },
    ]
  },
  {
    id: 2,
    title: '언제 들을 거야?',
    options: [
      { text: '아침 출근/등교길', scores: { trap_hype: 2, trap_melodic: 2, rnb_chill: 1 } },
      { text: '드라이브 중', scores: { trap_melodic: 3, rnb_smooth: 2, boombap_lyrical: 1 } },
      { text: '새벽 혼자 있을 때', scores: { trap_sad: 3, rnb_smooth: 2, boombap_lyrical: 2 } },
      { text: '파티/모임', scores: { trap_hype: 3, drill_dark: 2, rnb_smooth: 1 } },
    ]
  },
  {
    id: 3,
    title: '어떤 바이브가 좋아?',
    options: [
      { text: '가사가 찐한 랩', scores: { boombap_lyrical: 3, trap_sad: 2, drill_dark: 1 } },
      { text: '멜로디가 귀에 꽂히는', scores: { trap_melodic: 3, rnb_smooth: 2, trap_sad: 1 } },
      { text: '묵직하고 어두운', scores: { drill_dark: 3, boombap_lyrical: 2, trap_hype: 1 } },
      { text: '세련되고 감각적인', scores: { rnb_smooth: 3, rnb_chill: 2, trap_melodic: 1 } },
    ]
  },
  {
    id: 4,
    title: '좋아하는 아티스트가 있어?',
    options: [
      { text: '이센스/나플라', scores: { boombap_lyrical: 3, trap_sad: 1 } },
      { text: '딘/크러쉬/자이언티', scores: { rnb_smooth: 3, rnb_chill: 2 } },
      { text: '키드밀리/빌스택스', scores: { trap_hype: 2, drill_dark: 3 } },
      { text: '블라세/실키보이즈', scores: { drill_dark: 2, trap_hype: 3 } },
    ]
  }
];

const playlists: Record<PlaylistKey, { title: string; songs: { name: string; artist: string }[] }> = {
  trap_hype: {
    title: '⚡ Hype Trap — 에너지 폭발',
    songs: [
      { name: 'VVS (Feat. JUSTHIS) (Prod. GroovyRoom)', artist: '미란이, 먼치맨, Khundi Panda, 머쉬베놈' },
      { name: '아마두 (feat.우원재, 김효은, 넉살, Huckleberry P)', artist: '염따, 딥플로우, 팔로알토, The Quiett, 사이먼 도미닉' },
      { name: 'BAND', artist: '창모 (CHANGMO), Hash Swan, ASH ISLAND, 김효은' },
      { name: 'IndiGO', artist: '저스디스 (JUSTHIS), Kid Milli, NO:EL, 영비 (Young B)' },
      { name: 'METEOR', artist: '창모 (CHANGMO)' }
    ]
  },
  trap_sad: {
    title: '🌧 Emo Trap — 새벽 감성',
    songs: [
      { name: '시차 (We Are) (Feat. 로꼬 & GRAY)', artist: '우원재' },
      { name: '아름다워 (Beautiful)', artist: '창모 (CHANGMO)' },
      { name: 'To Myself', artist: 'DPR LIVE' },
      { name: '비도 오고 그래서 (Feat. 신용재)', artist: '헤이즈 (Heize)' },
      { name: 'Error (Feat. Loopy)', artist: 'ASH ISLAND' }
    ]
  },
  trap_melodic: {
    title: '🎵 Melody Trap — 귀에 꽂히는',
    songs: [
      { name: '아무노래', artist: '지코 (ZICO)' },
      { name: 'MELODY', artist: 'ASH ISLAND' },
      { name: 'We Are', artist: '우원재' },
      { name: '어떻게 지내', artist: 'Crush' },
      { name: 'METEOR', artist: '창모 (CHANGMO)' }
    ]
  },
  drill_dark: {
    title: '🖤 Dark Drill — 차갑고 묵직한',
    songs: [
      { name: 'GOTTASADAE', artist: 'BewhY' },
      { name: '도깨비 (Feat. ZICO, B-Free)', artist: '저스디스 (JUSTHIS)' },
      { name: '뿌리 (Feat. JUSTHIS) (Prod. GroovyRoom)', artist: 'Khundi Panda' },
      { name: 'Peace Out (Mega Mix)', artist: 'Blase (블라세)' },
      { name: 'BULLDOZER', artist: '스윙스 (Swings)' }
    ]
  },
  rnb_smooth: {
    title: '🌊 Smooth R&B — 감각적인 밤',
    songs: [
      { name: 'instagram', artist: 'DEAN' },
      { name: 'D (Half Moon) (Feat. 개코)', artist: 'DEAN' },
      { name: 'Jasmine', artist: 'DPR LIVE' },
      { name: '어떻게 지내', artist: 'Crush' },
      { name: 'Aqua Man', artist: '빈지노 (Beenzino)' }
    ]
  },
  rnb_chill: {
    title: '☁️ Chill R&B — 여유로운 하루',
    songs: [
      { name: 'Always Awake', artist: '빈지노 (Beenzino)' },
      { name: 'Action! (Feat. GRAY)', artist: 'DPR LIVE' },
      { name: '나만 아는 밴드', artist: 'BIG Naughty (서동현)' },
      { name: '너의 밤은 어때', artist: '그레이 (GRAY)' },
      { name: '시차 (We Are)', artist: '우원재' }
    ]
  },
  boombap_lyrical: {
    title: '📻 90s Soul — 가사로 때리는 붐뱁',
    songs: [
      { name: '비행 (Flight)', artist: 'E SENS' },
      { name: '독', artist: 'E SENS' },
      { name: 'Wu', artist: '나플라 (nafla)' },
      { name: '패 (Feat. 넉살, 딥플로우)', artist: 'EK' },
      { name: 'The Anecdote', artist: 'E SENS' }
    ]
  }
};

const initialScores: Record<PlaylistKey, number> = {
  trap_hype: 0, trap_sad: 0, trap_melodic: 0,
  drill_dark: 0, rnb_smooth: 0, rnb_chill: 0, boombap_lyrical: 0
};

// step: -1 = 인트로, 0~3 = 질문, 4 = 결과
export default function RecommendPage() {
  const [step, setStep] = useState(-1);
  const [scores, setScores] = useState<Record<PlaylistKey, number>>({ ...initialScores });
  const [history, setHistory] = useState<Record<PlaylistKey, number>[]>([]);

  const handleOptionClick = (option: Option) => {
    const newScores = { ...scores };
    Object.entries(option.scores).forEach(([key, value]) => {
      if (value) newScores[key as PlaylistKey] += value;
    });
    setHistory([...history, scores]); // 현재 scores 스냅샷 저장
    setScores(newScores);
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      // 첫 질문 → 인트로로
      setStep(-1);
      setScores({ ...initialScores });
      setHistory([]);
    } else {
      // 이전 질문 점수 복원
      const prev = history[history.length - 1];
      setScores(prev);
      setHistory(history.slice(0, -1));
      setStep(step - 1);
    }
  };

  const handleRestart = () => {
    setStep(-1);
    setScores({ ...initialScores });
    setHistory([]);
  };

  const isFinished = step >= questions.length;
  const progressPercentage = isFinished ? 100 : step < 0 ? 0 : (step / questions.length) * 100;

  let selectedPlaylist = playlists['trap_hype'];
  if (isFinished) {
    let maxScore = -1;
    let maxKey: PlaylistKey = 'trap_hype';
    Object.entries(scores).forEach(([key, value]) => {
      if (value > maxScore) { maxScore = value; maxKey = key as PlaylistKey; }
    });
    selectedPlaylist = playlists[maxKey];
  }

  return (
    <main className={`${styles.main} gridBackground`}>
      <main className={styles.container}>
        <h1 className={styles.title}>
          나만의 <span className={styles.highlight}>취향 분석 플리</span>
        </h1>

        <div className={styles.card}>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }} />
          </div>

          {/* ── 인트로 ── */}
          {step === -1 && (
            <div className={styles.introContainer}>
              <p className={styles.introEyebrow}>K-HIP HOP QUIZ</p>
              <h2 className={styles.introHeading}>당신의 힙합은<br />무엇인가요?</h2>
              <p className={styles.introSub}>
                4가지 질문으로 지금 이 순간에 딱 맞는<br />한국 힙합 플레이리스트를 찾아드려요.
              </p>
              <button className={styles.startBtn} onClick={() => setStep(0)}>
                알아보러 가기 →
              </button>
            </div>
          )}

          {/* ── 질문 ── */}
          {!isFinished && step >= 0 && (
            <>
              <button className={styles.backBtn} onClick={handleBack}>
                ← 이전
              </button>
              <h2 className={styles.questionTitle}>
                Q{questions[step].id}. {questions[step].title}
              </h2>
              <div className={styles.optionsGrid}>
                {questions[step].options.map((option, index) => (
                  <button
                    key={index}
                    className={styles.optionBtn}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── 결과 ── */}
          {isFinished && (
            <div className={styles.resultContainer}>
              <h2 className={styles.playlistTitle}>{selectedPlaylist.title}</h2>
              <div className={styles.songList}>
                {selectedPlaylist.songs.map((song, index) => (
                  <div key={index} className={styles.songItem}>
                    <span className={styles.songName}>{song.name}</span>
                    <span className={styles.artistName}>{song.artist}</span>
                  </div>
                ))}
              </div>
              <button className={styles.restartBtn} onClick={handleRestart}>
                다시 분석하기
              </button>
            </div>
          )}
        </div>
      </main>
    </main>
  );
}