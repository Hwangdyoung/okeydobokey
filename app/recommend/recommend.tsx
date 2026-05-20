'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/Recommend.module.css';

const questions = [
  {
    id: 'mood',
    question: '지금 기분이 어때?',
    options: [
      { label: '🔥 신나고 에너지 넘침', value: 'hype' },
      { label: '😔 감성적이고 쓸쓸함', value: 'sad' },
      { label: '😤 뭔가 화가 남', value: 'angry' },
      { label: '😌 여유롭고 편안함', value: 'chill' },
    ],
  },
  {
    id: 'time',
    question: '언제 들을 거야?',
    options: [
      { label: '🌅 아침 출근/등교길', value: 'morning' },
      { label: '🌆 드라이브 중', value: 'drive' },
      { label: '🌙 새벽 혼자 있을 때', value: 'latenight' },
      { label: '🎉 파티/모임', value: 'party' },
    ],
  },
  {
    id: 'vibe',
    question: '어떤 바이브가 좋아?',
    options: [
      { label: '🎤 가사가 찐한 랩', value: 'lyrical' },
      { label: '🎵 멜로디가 귀에 꽂히는', value: 'melodic' },
      { label: '💀 묵직하고 어두운', value: 'dark' },
      { label: '✨ 세련되고 감각적인', value: 'smooth' },
    ],
  },
  {
    id: 'artist',
    question: '이 중에 좋아하는 아티스트가 있어?',
    options: [
      { label: '이센스 / 나플라', value: 'boombap' },
      { label: '딘 / 크러쉬 / 자이언티', value: 'rnb' },
      { label: '키드밀리 / 빌스택스', value: 'trap' },
      { label: '블라세 / 실키보이즈', value: 'drill' },
    ],
  },
];

type Answers = Record<string, string>;

const playlistMap: Record<string, { title: string; tracks: { title: string; artist: string }[] }> = {
  boombap_lyrical: {
    title: '📻 90s Soul — 가사로 때리는 붐뱁',
    tracks: [
      { title: '소외', artist: '이센스 (E SENS)' },
      { title: '독', artist: '이센스 (E SENS)' },
      { title: 'Anok', artist: '나플라 (nafla)' },
      { title: 'PRIDE', artist: '나플라 (nafla)' },
      { title: 'Grey', artist: '오웬 (Owen Ovadoz)' },
    ],
  },
  rnb_smooth: {
    title: '🌊 Smooth R&B — 감각적인 밤',
    tracks: [
      { title: 'Hopeless Romantic', artist: '딘 (DEAN)' },
      { title: 'Violet', artist: '릴러말즈 (Leellamarz)' },
      { title: 'Daydream', artist: '크러쉬 (Crush)' },
      { title: '양화대교', artist: '자이언티 (Zion.T)' },
      { title: 'Winterfall', artist: '딘 (DEAN)' },
    ],
  },
  trap_hype: {
    title: '⚡ Hype Trap — 에너지 폭발',
    tracks: [
      { title: 'WHY DO FUCKBOIS...', artist: '키드밀리 (Kid Milli)' },
      { title: 'CROWN', artist: '키드밀리 (Kid Milli)' },
      { title: 'Detox', artist: '빌스택스 (Bill Stax)' },
      { title: 'THUNDER GROUND', artist: 'Dok2' },
      { title: 'METEOR', artist: '창모 (CHANGMO)' },
    ],
  },
  trap_sad: {
    title: '🌧 Emo Trap — 새벽 감성',
    tracks: [
      { title: '새벽 세 시', artist: '해쉬스완 (Hash Swan)' },
      { title: 'PAIN', artist: '해쉬스완 (Hash Swan)' },
      { title: '흘러가', artist: '루피 (Loopy)' },
      { title: 'Black Out', artist: '루피 (Loopy)' },
      { title: '새벽 감성', artist: '스윙스 ft. 해쉬스완' },
    ],
  },
  drill_dark: {
    title: '🖤 Dark Drill — 차갑고 묵직한',
    tracks: [
      { title: 'BLASÉ', artist: '블라세 (BLASÉ)' },
      { title: 'Cold', artist: '실키보이즈 (SILKYBOIZ)' },
      { title: 'No Hook', artist: '플리키뱅 (Flikey Bang)' },
      { title: 'Pressure', artist: '블라세 (BLASÉ)' },
      { title: 'Opp Thot', artist: '플리키뱅 (Flikey Bang)' },
    ],
  },
  rnb_chill: {
    title: '☁️ Chill R&B — 여유로운 하루',
    tracks: [
      { title: 'Cereal', artist: '크러쉬 (Crush)' },
      { title: 'Always', artist: 'Zion.T' },
      { title: 'Nosedive', artist: '크러쉬 (Crush)' },
      { title: 'Red', artist: '릴러말즈 (Leellamarz)' },
      { title: 'Starry Night', artist: '마마무 (MAMAMOO)' },
    ],
  },
  trap_melodic: {
    title: '🎵 Melody Trap — 귀에 꽂히는',
    tracks: [
      { title: 'Ring Ring', artist: '식케이 (Sik-K)' },
      { title: 'METEOR', artist: '창모 (CHANGMO)' },
      { title: 'Photograph', artist: '노엘 (Noel)' },
      { title: 'Berry Berry', artist: '창모 ft. 식케이' },
      { title: 'Summer Hate', artist: '지코 ft. 펀치' },
    ],
  },
  default: {
    title: '🎧 K-HipHop 입문 — 다 좋아할 플레이리스트',
    tracks: [
      { title: '양화대교', artist: '자이언티 (Zion.T)' },
      { title: 'METEOR', artist: '창모 (CHANGMO)' },
      { title: 'Ring Ring', artist: '식케이 (Sik-K)' },
      { title: 'Daydream', artist: '크러쉬 (Crush)' },
      { title: 'Anok', artist: '나플라 (nafla)' },
    ],
  },
};

function getPlaylist(answers: Answers) {
  const { mood, vibe, artist } = answers;

  const key1 = `${artist}_${vibe}`;
  const key2 = `${artist}_${mood}`;

  if (playlistMap[key1]) return playlistMap[key1];
  if (playlistMap[key2]) return playlistMap[key2];

  // fallback 매핑
  if (mood === 'hype' && artist === 'trap') return playlistMap['trap_hype'];
  if (mood === 'sad') return playlistMap['trap_sad'];
  if (mood === 'chill') return playlistMap['rnb_chill'];
  if (vibe === 'dark') return playlistMap['drill_dark'];
  if (vibe === 'melodic') return playlistMap['trap_melodic'];
  if (vibe === 'smooth') return playlistMap['rnb_smooth'];
  if (artist === 'boombap') return playlistMap['boombap_lyrical'];
  if (artist === 'rnb') return playlistMap['rnb_smooth'];
  if (artist === 'drill') return playlistMap['drill_dark'];
  if (artist === 'trap') return playlistMap['trap_hype'];

  return playlistMap['default'];
}

export default function RecommendPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<null | ReturnType<typeof getPlaylist>>(null);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[step].id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setResult(getPlaylist(newAnswers));
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  const progress = ((step) / questions.length) * 100;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div style={{ paddingTop: '90px', marginBottom: '2rem' }}>
          <Link href="/" className={styles.backLink}>← 뒤로 가기</Link>
        </div>

        <div className={styles.header}>
          <p className={styles.eyebrow}> TASTE ANALYSIS</p>
          <h1 className={styles.title}>취향 플레이리스트</h1>
          <p className={styles.desc}>몇 가지 질문에 답하면 딱 맞는 플레이리스트를 추천해드려요</p>
        </div>

        {!result ? (
          <div className={styles.quizWrap}>
            {/* 진행 바 */}
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.stepLabel}>{step + 1} / {questions.length}</p>

            <div className={styles.questionCard}>
              <h2 className={styles.question}>{questions[step].question}</h2>
              <div className={styles.options}>
                {questions[step].options.map((opt) => (
                  <button
                    key={opt.value}
                    className={styles.optionBtn}
                    onClick={() => handleAnswer(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.resultWrap}>
            <p className={styles.resultEyebrow}>당신을 위한 플레이리스트</p>
            <h2 className={styles.resultTitle}>{result.title}</h2>

            <ul className={styles.trackList}>
              {result.tracks.map((track, i) => (
                <li key={i} className={styles.trackItem}>
                  <span className={styles.trackNum}>{String(i + 1).padStart(2, '0')}</span>
                  <div className={styles.trackInfo}>
                    <span className={styles.trackTitle}>{track.title}</span>
                    <span className={styles.trackArtist}>{track.artist}</span>
                  </div>
                </li>
              ))}
            </ul>

            <button className={styles.retryBtn} onClick={handleReset}>
              다시 분석하기
            </button>
          </div>
        )}
      </div>
    </main >
  );
}
