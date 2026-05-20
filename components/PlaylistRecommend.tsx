'use client';

import { useState } from 'react';
import styles from '@/styles/PlaylistRecommend.module.css';

interface SubGenre {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  artists: string;
}

interface PlaylistRecommendProps {
  subGenres: SubGenre[];
  genre: string; // 'trap' | 'rnb' | 'drill' | 'boombap'
}

const playlistData: Record<string, Record<string, { title: string; artist: string; album: string }[]>> = {
  trap: {
    melody: [
      { title: 'Ring Ring', artist: '식케이 (Sik-K)', album: 'FL1P' },
      { title: 'party', artist: '식케이 (Sik-K)', album: 'party' },
      { title: 'Photograph', artist: '노엘 (Noel)', album: 'Photograph' },
      { title: 'VIBE', artist: '타이거JK ft. 윤미래', album: 'VIBE' },
      { title: 'Summer Hate', artist: '지코 ft. 펀치', album: 'Summer Hate' },
    ],
    emo: [
      { title: '새벽 세 시', artist: '해쉬스완 (Hash Swan)', album: '새벽 세 시' },
      { title: 'PAIN', artist: '해쉬스완 (Hash Swan)', album: 'PAIN' },
      { title: '흘러가', artist: '루피 (Loopy)', album: '흘러가' },
      { title: 'Black Out', artist: '루피 (Loopy)', album: 'Black Out' },
      { title: '새벽 감성', artist: '스윙스 ft. 해쉬스완', album: '새벽 감성' },
    ],
    hard: [
      { title: 'WHY DO FUCKBOIS...', artist: '키드밀리 (Kid Milli)', album: 'indigo' },
      { title: 'CROWN', artist: '키드밀리 (Kid Milli)', album: 'CROWN' },
      { title: 'Detox', artist: '빌스택스 (Bill Stax)', album: 'Detox' },
      { title: 'BUFFALO', artist: '빌스택스 (Bill Stax)', album: 'BUFFALO' },
      { title: 'THUNDER GROUND', artist: 'Dok2', album: 'THUNDER GROUND' },
    ],
    pop: [
      { title: 'METEOR', artist: '창모 (CHANGMO)', album: 'METEOR' },
      { title: 'Maestro', artist: '창모 (CHANGMO)', album: 'Maestro' },
      { title: '빌었어', artist: '창모 (CHANGMO)', album: '빌었어' },
      { title: 'GANG', artist: '창모 ft. 저스디스', album: 'GANG' },
      { title: 'Berry Berry', artist: '창모 ft. 식케이', album: 'Berry Berry' },
    ],
  },
  rnb: {
    alternative: [
      { title: 'instagram', artist: 'DEAN', album: 'instagram' },
      { title: 'Dancing In The Rain', artist: 'Rad Museum', album: 'RAD' },
      { title: '마음대로', artist: 'Colde (콜드)', album: 'Wave' },
      { title: '어떻게 지내', artist: 'Crush (크러쉬)', album: 'wonderlost' },
      { title: '멋지게 인사하는 법 (feat. 슬기)', artist: 'Zion.T', album: 'ZZZ' }
    ],
    chill: [
      { title: '야망 (feat. Ash Island)', artist: '릴러말즈 (Leellamarz)', album: 'MARZ 2 AMBITION' },
      { title: 'NAPPA', artist: 'Crush (크러쉬)', album: 'From Midnight To Sunrise' },
      { title: '정이라고 하자 (feat. 10CM)', artist: 'BIG Naughty (서동현)', album: '정이라고 하자' },
      { title: 'L.I.E', artist: '페노메코 (Penomeco)', album: 'Garden' },
      { title: 'Homebody', artist: 'pH-1', album: 'HALO' }
    ],
    emotional: [
      { title: 'D (Half Moon) (feat. 개코)', artist: 'DEAN', album: '130 mood: TRBL' },
      { title: '돌아오지마 (feat. 용준형)', artist: '헤이즈 (Heize)', album: 'And July' },
      { title: '잊어버리지마 (feat. 태연)', artist: 'Crush (크러쉬)', album: '잊어버리지마' },
      { title: 'Hate Everything', artist: '지소울 (GSoul)', album: 'Hate Everything' },
      { title: '시차 (We Are) (Feat. 로꼬 & GRAY)', artist: '우원재', album: '시차' }
    ],
    neo: [
      { title: '양화대교', artist: '자이언티 (Zion.T)', album: '양화대교' },
      { title: '창문', artist: '서사무엘 (Samuel Seo)', album: 'Ego Expand (100%)' },
      { title: '물음표 (feat. 최자, Zion.T)', artist: '프라이머리 (Primary)', album: 'Primary And Messengers LP' },
      { title: 'Sofa', artist: 'Crush (크러쉬)', album: 'Sofa' },
      { title: '21', artist: 'DEAN', album: '130 mood: TRBL' }
    ]
  },
  drill: {
    uk: [
      { title: '치트키 (feat. 이영지)', artist: '블라세 (BLASÉ)', album: '치트키' },
      { title: '으랏차차 (feat. Homies)', artist: 'NSW yoon', album: '으랏차차' },
      { title: 'My Name Is Fleeky', artist: '플리키뱅 (Fleeky Bang)', album: 'My Name Is Fleeky' },
      { title: 'VOLUME ONE', artist: '실키보이즈 (SILKYBOIZ)', album: 'VOLUME ONE' },
      { title: 'Peace Out (Mega Mix)', artist: '블라세 (BLASÉ)', album: 'Multrill-ionaire' }
    ],
    dark: [
      { title: 'BALLON D\'OR', artist: 'NSW yoon', album: 'BALLON D\'OR' },
      { title: 'The Predator', artist: '플리키뱅 (Fleeky Bang)', album: 'The Predator' },
      { title: 'Pop It (feat. Koonta)', artist: '블라세 (BLASÉ)', album: 'Pop It' },
      { title: 'Drill Killa', artist: 'Polodred (폴로드레드)', album: 'Drill Killa' },
      { title: 'Drill Type Sh*t', artist: 'Street Baby', album: 'Drill Type Sh*t' }
    ],
    aggressive: [
      { title: 'Block', artist: '플리키뱅 (Fleeky Bang)', album: 'Block' },
      { title: 'Run!', artist: 'NSW yoon', album: 'Run!' },
      { title: 'Drop It', artist: '블라세 (BLASÉ)', album: 'Drop It' },
      { title: 'GANG GANG', artist: 'Polodred (폴로드레드)', album: 'GANG GANG' },
      { title: 'Drill Out', artist: 'Street Baby', album: 'Drill Out' }
    ],
    melodic: [
      { title: 'Melody', artist: '애쉬 아일랜드 (ASH ISLAND)', album: 'ISLAND' },
      { title: 'STILL', artist: '릴러말즈 (Leellamarz)', album: 'STILL' },
      { title: 'Melody Drill', artist: '실키보이즈 (SILKYBOIZ)', album: 'Melody Drill' },
      { title: 'Pain Drill', artist: '블라세 (BLASÉ)', album: 'Pain Drill' },
      { title: 'Love Drill', artist: '플리키뱅 (Fleeky Bang)', album: 'Love Drill' }
    ]
  },
  boombap: {
    classic: [
      { title: '비행 (Flight)', artist: '이센스 (E SENS)', album: 'The Anecdote' },
      { title: '독', artist: '이센스 (E SENS)', album: '독' },
      { title: 'Wu', artist: '나플라 (nafla)', album: 'Angels' },
      { title: '작두 (feat. 넉살, Huckleberry P)', artist: '딥플로우 (Deepflow)', album: '양화' },
      { title: 'Good Times (feat. Babylon)', artist: '팔로알토 (Paloalto)', album: 'Good Times' }
    ],
    jazz: [
      { title: '아까워', artist: '재지팩트 (Jazzyfact)', album: 'Lifes Like' },
      { title: 'Smoking Dreams', artist: '재지팩트 (Jazzyfact)', album: 'Lifes Like' },
      { title: '히피의 아침', artist: '화지 (Hwaji)', album: 'ZISSOU' },
      { title: 'Fancy (feat. Dean)', artist: '팔로알토 (Paloalto)', album: 'Fancy' },
      { title: 'Writer\'s Block', artist: '이센스 (E SENS)', album: 'The Anecdote' }
    ],
    underground: [
      { title: 'JAIL', artist: '나플라 (nafla)', album: 'Angels' },
      { title: 'Gone', artist: '저스디스 (JUSTHIS)', album: '2 Many Homes 4 1 Kid' },
      { title: '당산대형', artist: '딥플로우 (Deepflow)', album: '양화' },
      { title: 'City', artist: '오웬 (Owen)', album: 'City' },
      { title: 'MOMMY', artist: '나플라 (nafla)', album: 'Angels' }
    ],
    oldschool: [
      { title: '고백 (feat. 정인)', artist: '다이나믹 듀오 (Dynamic Duo)', album: 'Double Dynamite' },
      { title: '발레리노 (feat. Ali)', artist: '리쌍 (Leessang)', album: 'Black Sun' },
      { title: 'Fly', artist: '에픽하이 (Epik High)', album: 'Swan Songs' },
      { title: '영순위 (feat. 넉업샤)', artist: '가리온 (Garion)', album: 'Garion 2' },
      { title: '8:45 Heaven', artist: '드렁큰 타이거 (Drunken Tiger)', album: 'Sky Is The Limit' }
    ]
  }
};

export default function PlaylistRecommend({ subGenres, genre }: PlaylistRecommendProps) {
  const [selectedSubGenre, setSelectedSubGenre] = useState<string | null>(null);

  const genreData = playlistData[genre];

  const getPlaylist = (subGenreId: string) => {
    if (!genreData) return [];
    return genreData[subGenreId] || [];
  };

  const handleCardClick = (subGenreId: string) => {
    setSelectedSubGenre(selectedSubGenre === subGenreId ? null : subGenreId);
  };

  return (
    <section className={`${styles.section} ${styles[genre]}`}>
      <h2 className={styles.sectionTitle}>플레이리스트 추천</h2>
      <p className={styles.sectionDesc}>세부 스타일에 어울리는 국내 대표 아카이브 플레이리스트</p>

      <div className={styles.gridContainer}>
        {subGenres.map((sub) => (
          <div
            key={sub.id}
            className={`${styles.subCard} ${selectedSubGenre === sub.id ? styles.active : ''}`}
            onClick={() => handleCardClick(sub.id)}
          >
            {sub.tagline && <span className={styles.tagline}>{sub.tagline}</span>}
            <h3>{sub.name}</h3>
            <p className={styles.subDesc}>{sub.description}</p>
            <div className={styles.artistsWrap}>
              <span className={styles.artistLabel}>대표 아티스트:</span>
              <span className={styles.subArtists}>{sub.artists}</span>
            </div>
            <button
              type="button"
              className={styles.spotifyBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(sub.id);
              }}
            >
              {selectedSubGenre === sub.id ? (
                <>
                  <span className={styles.btnIcon}>✕</span> 닫기
                </>
              ) : (
                <>
                  <span className={styles.btnIcon}>▶</span> 들으러 가기
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {selectedSubGenre && (
        <div className={styles.playlistWrap}>
          <h3 className={styles.playlistTitle}>
            {subGenres.find((s) => s.id === selectedSubGenre)?.name} 플레이리스트
          </h3>
          <ul className={styles.trackList}>
            {getPlaylist(selectedSubGenre).map((track, i) => (
              <li key={i} className={styles.trackItem}>
                <span className={styles.trackNum}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.trackInfo}>
                  <span className={styles.trackTitle}>{track.title}</span>
                  <span className={styles.trackArtist}>{track.artist}</span>
                </div>
                <span className={styles.trackAlbum}>{track.album}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
