'use client';

import { useState } from 'react';
import styles from '@/styles/PlaylistRecommend.module.css';

interface SubGenre {
  id: string;
  name: string;
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
    classic: [
      { title: 'Always', artist: 'Zion.T', album: 'Red Light' },
      { title: '양화대교', artist: '자이언티 (Zion.T)', album: '양화대교' },
      { title: 'Oppa', artist: '딘 (DEAN)', album: '130 Mood: TRBL' },
      { title: 'D (Half Moon)', artist: '딘 (DEAN) ft. 에릭남', album: 'D (Half Moon)' },
      { title: 'Gone', artist: '딘 (DEAN)', album: 'Gone' },
    ],
    alt: [
      { title: 'Hopeless Romantic', artist: '딘 (DEAN)', album: 'Hopeless Romantic' },
      { title: 'Violet', artist: '릴러말즈 (Leellamarz)', album: 'Violet' },
      { title: 'Villain', artist: '릴러말즈 (Leellamarz)', album: 'Villain' },
      { title: 'Daydream', artist: '크러쉬 (Crush)', album: 'Daydream' },
      { title: 'Cereal', artist: '크러쉬 (Crush)', album: 'Cereal' },
    ],
    soul: [
      { title: 'Eyes, Nose, Lips', artist: '태양 ft. 빅뱅', album: 'RISE' },
      { title: 'Be My Baby', artist: '위너 (WINNER)', album: '2014 S/S' },
      { title: '그대여', artist: '박재범 (Jay Park)', album: '그대여' },
      { title: 'Metronome', artist: '크러쉬 (Crush)', album: 'Metronome' },
      { title: 'Beautiful', artist: '자이언티 (Zion.T)', album: 'Beautiful' },
    ],
    neo: [
      { title: 'Winterfall', artist: '딘 (DEAN)', album: 'Winterfall' },
      { title: 'Red', artist: '릴러말즈 (Leellamarz)', album: 'Red' },
      { title: 'Nosedive', artist: '크러쉬 (Crush)', album: 'Nosedive' },
      { title: 'Nappa', artist: '릴러말즈 (Leellamarz)', album: 'Nappa' },
      { title: 'Starry Night', artist: '마마무 (MAMAMOO)', album: 'Starry Night' },
    ],
  },
  drill: {
    uk: [
      { title: 'BLASÉ', artist: '블라세 (BLASÉ)', album: 'BLASÉ' },
      { title: 'Cold', artist: '실키보이즈 (SILKYBOIZ)', album: 'Cold' },
      { title: 'Opp Thot', artist: '플리키뱅 (Flikey Bang)', album: 'Opp Thot' },
      { title: 'Slide', artist: '블라세 (BLASÉ)', album: 'Slide' },
      { title: 'DRILL', artist: '실키보이즈 (SILKYBOIZ)', album: 'DRILL' },
    ],
    chicago: [
      { title: 'No Hook', artist: '플리키뱅 (Flikey Bang)', album: 'No Hook' },
      { title: 'Pressure', artist: '블라세 (BLASÉ)', album: 'Pressure' },
      { title: 'Street', artist: '실키보이즈 (SILKYBOIZ)', album: 'Street' },
      { title: 'Hood', artist: '플리키뱅 (Flikey Bang)', album: 'Hood' },
      { title: 'Opps', artist: '블라세 (BLASÉ)', album: 'Opps' },
    ],
    melodic: [
      { title: 'Melody Drill', artist: '실키보이즈 (SILKYBOIZ)', album: 'Melody Drill' },
      { title: 'Pain Drill', artist: '블라세 (BLASÉ)', album: 'Pain Drill' },
      { title: 'Love Drill', artist: '플리키뱅 (Flikey Bang)', album: 'Love Drill' },
      { title: 'Sad Drill', artist: '실키보이즈 (SILKYBOIZ)', album: 'Sad Drill' },
      { title: 'Emo Drill', artist: '블라세 (BLASÉ)', album: 'Emo Drill' },
    ],
  },
  boombap: [
    { title: '소외', artist: '이센스 (E SENS)', album: '소외' },
    { title: 'Anok', artist: '나플라 (nafla)', album: 'Anok' },
    { title: 'Grey', artist: '오웬 (Owen Ovadoz)', album: 'Grey' },
    { title: '독', artist: '이센스 (E SENS)', album: '독' },
    { title: 'PRIDE', artist: '나플라 (nafla)', album: 'PRIDE' },
  ],
};

export default function PlaylistRecommend({ subGenres, genre }: PlaylistRecommendProps) {
  const [selectedSubGenre, setSelectedSubGenre] = useState<string | null>(null);

  const genreData = playlistData[genre];

  const getPlaylist = (subGenreId: string) => {
    if (!genreData) return [];
    if (Array.isArray(genreData)) return genreData;
    return genreData[subGenreId] || [];
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>플레이리스트 추천</h2>
      <p className={styles.sectionDesc}>세부 스타일을 선택하면 어울리는 곡을 추천해드려요</p>

      <div className={styles.subGenreButtons}>
        {subGenres.map((sub) => (
          <button
            key={sub.id}
            className={`${styles.subBtn} ${selectedSubGenre === sub.id ? styles.active : ''}`}
            onClick={() => setSelectedSubGenre(selectedSubGenre === sub.id ? null : sub.id)}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {selectedSubGenre && (
        <div className={styles.playlistWrap}>
          <h3 className={styles.playlistTitle}>
            {subGenres.find(s => s.id === selectedSubGenre)?.name} 플레이리스트
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
