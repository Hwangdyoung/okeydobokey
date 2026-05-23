'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/Rising.module.css';

const artists = [
  {
    id: 'effie',
    name: 'Effie',
    nameKo: '에피',
    genre: 'Experimental Hip-Hop',
    track: 'CAN I SIP 담배',
    spotify: 'https://open.spotify.com/artist/5PIWabZPdU3YWRMbvD5nQJ',
    melon: 'https://www.melon.com/artist/timeline.htm?artistId=2881094',
    image: '/effie.png',
  },
  {
    id: 'mollyyam',
    name: 'Molly Yam',
    nameKo: '몰리얌',
    genre: 'Alternative Trap',
    track: 'Burning Slow',
    spotify: 'https://open.spotify.com/artist/52Rh1eNJIw4i8E3qZGTSHP',
    melon: 'https://www.melon.com/artist/timeline.htm?artistId=4098168',
    image: '/mollyyam.png',
  },
  {
    id: 'shinjihang',
    name: 'shinjihang',
    nameKo: '신지항',
    genre: 'Alternative Hip-Hop',
    track: 'NIGHT CRUISE',
    spotify: 'https://open.spotify.com/artist/6LGvFSi2nlVrapbgljktyj',
    melon: 'https://www.melon.com/artist/timeline.htm?artistId=2864036',
    image: '/shinjihang.png',
  },
  {
    id: 'systemseoul',
    name: 'SYSTEM SEOUL',
    nameKo: '시스템서울',
    genre: 'Drill / Trap',
    track: 'SEOUL CITY',
    spotify: 'https://open.spotify.com/artist/1YBOO3E40cq9VVNUHeQGDm',
    melon: 'https://www.melon.com/artist/timeline.htm?artistId=4845184',
    image: '/system.png',
  },
  {
    id: 'nowimyoung',
    name: 'NOWIMYOUNG',
    nameKo: '나우아임영',
    genre: 'Boom Bap',
    track: 'AH AH',
    spotify: 'https://open.spotify.com/artist/66LxteaHD7NvxCnkQoyw2G',
    melon: 'https://www.melon.com/artist/timeline.htm?artistId=3103330',
    image: '/nowimyoung.png',
  },
  {
    id: 'yoondahye',
    name: 'Yoon Da Hye',
    nameKo: '윤다혜',
    genre: 'R&B / Soul',
    track: '그녀는 손가락 금붕어',
    spotify: 'https://open.spotify.com/artist/1MMvp9AK4S9WKByz3xt83F',
    melon: 'https://www.melon.com/artist/timeline.htm?artistId=2953160',
    image: '/dahye.png',
  },
];

export default function RisingPage() {
  const [visible, setVisible] = useState<boolean[]>(new Array(artists.length).fill(false));

  useEffect(() => {
    artists.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 180);
    });
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        <div className={styles.hero}>
          <p className={styles.eyebrow}>RISING ARTISTS · KHA 2026</p>
          <h1 className={styles.title}>저점매수</h1>
          <p className={styles.subtitle}>
            지금 담아야 할 한국 힙합 신예들. 나중에 후회하기 전에.
          </p>
        </div>

        <div className={styles.grid}>
          {artists.map((artist, i) => (
            <div
              key={artist.id}
              className={`${styles.card} ${visible[i] ? styles.cardVisible : ''}`}
            >
              <div className={styles.imageWrap}>
                <img
                  src={artist.image}
                  alt={artist.name}
                  className={styles.image}
                />
              </div>

              <div className={styles.info}>
                <span className={styles.genre}>{artist.genre}</span>
                <h3 className={styles.name}>{artist.nameKo}</h3>
                <p className={styles.nameEn}>{artist.name}</p>
                <p className={styles.track}>{artist.track}</p>
              </div>

              <div className={styles.links}>
                <a
                  href={artist.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkBtn}
                >
                  Spotify
                </a>
                <a
                  href={artist.melon}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkBtn}
                >
                  Melon
                </a>
              </div>
            </div>
          ))}
        </div>

      </div >
    </main >
  );
}