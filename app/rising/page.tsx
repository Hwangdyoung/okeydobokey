'use client';

import { useState } from 'react';
import styles from '@/styles/Rising.module.css';

const rappers = [
  {
    id: 'effie',
    name: 'Effie (에피)',
    genre: '하이퍼팝 / 멜로디 트랩',
    label: 'My Unnies',
    debut: '2019년',
    rep: 'Acid Fly',
    desc: '사운드클라우드에서 인지도를 쌓은 여성 래퍼. 하이퍼팝과 멜로디컬 트랩을 자유롭게 넘나들며 독보적인 감성을 구축했다. 대니 브라운의 샤라웃을 받고 aespa 지젤의 팬으로도 알려지며 글로벌 인디 씬에서도 주목받고 있다.',
    tag: '🌐 하이퍼팝',
  },
  {
    id: 'okashii',
    name: 'OKASHII (오카시)',
    genre: '얼터너티브 힙합 / R&B',
    label: 'Mine Field',
    debut: '2020년',
    rep: 'Blue',
    desc: '연세대학교 힙합 동아리 RYU 출신 크루. Cold Bay, Jeffery White, Raf Sandou 등으로 구성되어 있으며 스윙스의 Mine Field 소속. 감각적인 앨범 구성과 세련된 사운드로 힙합 씬에서 빠르게 입소문을 탔다.',
    tag: '🎨 얼터너티브',
  },
  {
    id: '0siggy',
    name: '0siggy (영시기)',
    genre: '트랩 / 드릴',
    label: '인디',
    debut: '2022년',
    rep: 'TESLA',
    desc: '비와이의 샤라웃을 받으며 주목받기 시작한 신예 래퍼. 전 랩네임은 "복대영식". EP [ICN]으로 이름을 알렸고 독특한 플로우와 차가운 트랩 사운드가 특징이다.',
    tag: '❄️ 드릴',
  },
  {
    id: 'fleeky',
    name: '플리키뱅 (Fleeky Bang)',
    genre: '드릴 / 트랩',
    label: '인디',
    debut: '2021년',
    rep: 'Opp Thot',
    desc: 'UK 드릴 사운드를 한국에 이식한 선구자 중 한 명. 차갑고 거친 비트 위에 날카로운 래핑으로 드릴 팬들의 지지를 받고 있다. 쇼미더머니12 출연으로 대중적 인지도도 확보했다.',
    tag: '🔪 드릴',
  },
  {
    id: 'loopy',
    name: '루피 (Loopy)',
    genre: '감성 트랩 / 얼터너티브',
    label: '인디',
    debut: '2019년',
    rep: '흘러가',
    desc: '몽환적인 분위기와 감성적인 가사로 많은 팬층을 보유한 래퍼. 해쉬스완과의 협업으로도 유명하며 새벽 감성을 담은 트랩 사운드가 특기다.',
    tag: '🌙 감성',
  },
  {
    id: 'haon',
    name: '김하온 (Haon)',
    genre: '붐뱁 / 컨셔스',
    label: '인디',
    debut: '2018년',
    rep: '꼴통',
    desc: '고등래퍼2 우승으로 데뷔한 뒤 꾸준히 자신만의 음악을 만들어가는 래퍼. 2025 한국 힙합 어워즈 올해의 트랙을 수상하며 씬에서 확고한 위치를 차지했다.',
    tag: '🏆 컨셔스',
  },
  {
    id: 'noel',
    name: '노엘 (Noel)',
    genre: '멜로디 트랩',
    label: 'KC',
    debut: '2020년',
    rep: 'Photograph',
    desc: '식케이와 같은 KC 소속의 멜로디 트랩 래퍼. 오토튠과 감성 멜로디를 활용한 스타일로 젊은 힙합 팬들의 마음을 사로잡고 있다.',
    tag: '🎵 멜로디',
  },
  {
    id: 'hashswan',
    name: '해쉬스완 (Hash Swan)',
    genre: '감성 트랩 / 이모 랩',
    label: '인디',
    debut: '2017년',
    rep: '새벽 세 시',
    desc: '새벽 감성과 우울한 감정을 음악으로 풀어내는 이모 랩의 대표 주자. "새벽 세 시" 등의 곡으로 많은 공감을 얻었으며 한국 이모 랩 씬을 개척했다.',
    tag: '🌃 이모',
  },
];

export default function RisingPage() {
  const [selected, setSelected] = useState<typeof rappers[0] | null>(null);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>RISING ARTISTS</p>
          <h1 className={styles.title}>저점매수</h1>
          <p className={styles.subtitle}>지금 담아야 할 한국 힙합 신예들. 나중에 후회하기 전에.</p>
        </div>

        <div className={styles.grid}>
          {rappers.map((rapper) => (
            <div
              key={rapper.id}
              className={`${styles.card} ${selected?.id === rapper.id ? styles.active : ''}`}
              onClick={() => setSelected(selected?.id === rapper.id ? null : rapper)}
            >
              <div className={styles.cardInitial}>{rapper.name.charAt(0)}</div>
              <div className={styles.cardInfo}>
                <span className={styles.cardTag}>{rapper.tag}</span>
                <h3 className={styles.cardName}>{rapper.name}</h3>
                <p className={styles.cardGenre}>{rapper.genre}</p>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <div className={styles.detailInitial}>{selected.name.charAt(0)}</div>
              <div>
                <h2 className={styles.detailName}>{selected.name}</h2>
                <p className={styles.detailGenre}>{selected.genre}</p>
              </div>
            </div>
            <p className={styles.detailDesc}>{selected.desc}</p>
            <div className={styles.detailMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>데뷔</span>
                <span className={styles.metaValue}>{selected.debut}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>소속</span>
                <span className={styles.metaValue}>{selected.label}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>대표곡</span>
                <span className={`${styles.metaValue} ${styles.repSong}`}>🎵 {selected.rep}</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>닫기 ✕</button>
          </div>
        )}
      </div>
    </main>
  );
}
