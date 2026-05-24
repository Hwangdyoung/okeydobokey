'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '@/styles/GenreSection.module.css';
import genreData from '@/data/genres.json';

interface Genre {
  id: string;
  name: string;
  nameKo: string;
  tagline: string;
  description: string;
  color: string;
  year: string;
  artists: string[];
  bpm: string;
  direction: 'left' | 'right';
  index: number;
  image?: string;
}

function GenreCard({ genre }: { genre: Genre }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLElement[]>([]);

  const isReverse = genre.direction === 'right';

  useEffect(() => {
    const targets = [
      ...(visualRef.current ? [visualRef.current] : []),
      ...(contentRef.current ? [contentRef.current] : []),
      ...childrenRef.current,
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          } else {
            entry.target.classList.remove(styles.visible);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addChildRef = (el: HTMLElement | null, idx: number) => {
    if (el) childrenRef.current[idx] = el;
  };

  const delays = [styles.delay100, styles.delay200, styles.delay300, styles.delay400, styles.delay500, styles.delay600];

  return (
    <article
      ref={cardRef}
      className={`${styles.genreCard} ${isReverse ? styles.reverse : ''}`}
      id={`genre-${genre.id}`}
    >
      {/* Visual Side */}
      <div
        ref={visualRef}
        className={`${styles.genreVisual} ${genre.direction === 'left' ? styles.slideFromLeft : styles.slideFromRight}`}
      >
        <div className={styles.genreVisualInner}>
          {/* 이미지 먼저 (맨 아래) */}
          {genre.image && (
            <img
              src={genre.image}
              alt={genre.name}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.45,
                mixBlendMode: 'luminosity',
                maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
              }}
            />
          )}
          {/* 그라디언트 위에 살짝 덮기 */}
          <div className={`${styles.visualBg} ${styles[genre.id as keyof typeof styles]}`} />

          <span className={styles.genreNameBig}>{genre.name}</span>
        </div>
      </div>

      {/* Content Side */}
      <div
        ref={contentRef}
        className={`${styles.genreContent} ${isReverse ? styles.slideFromRight : styles.slideFromLeft}`}
      >
        <div
          ref={(el) => addChildRef(el as HTMLElement | null, 0)}
          className={`${styles.genreIndex} ${styles.fadeUp} ${delays[0]}`}
        >
          {String(genre.index + 1).padStart(2, '0')} / {genre.nameKo}
        </div>

        <h2
          ref={(el) => addChildRef(el as HTMLElement | null, 1)}
          className={`${styles.genreName} ${styles.fadeUp} ${delays[1]}`}
        >
          {genre.name}
        </h2>

        <p
          ref={(el) => addChildRef(el as HTMLElement | null, 2)}
          className={`${styles.genreTagline} ${styles.fadeUp} ${delays[2]}`}
        >
          &ldquo;{genre.tagline}&rdquo;
        </p>

        <p
          ref={(el) => addChildRef(el as HTMLElement | null, 3)}
          className={`${styles.genreDesc} ${styles.fadeUp} ${delays[3]}`}
        >
          {genre.description}
        </p>

        <div
          ref={(el) => addChildRef(el as HTMLElement | null, 4)}
          className={`${styles.genreMeta} ${styles.fadeUp} ${delays[4]}`}
        >
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Origin</span>
            <span className={styles.metaValue}>{genre.year}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>BPM</span>
            <span className={styles.metaValue}>{genre.bpm}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Artists</span>
            <div className={styles.artistList}>
              {genre.artists.map((artist) => (
                <span key={artist} className={styles.artistChip}>{artist}</span>
              ))}
            </div>
          </div>
        </div>

        <Link
          href={`/genre/${genre.id}`}
          ref={(el) => addChildRef(el as HTMLAnchorElement | null, 5)}
          className={`${styles.ctaBtn} ${styles.fadeUp} ${delays[5]}`}
          id={`cta-${genre.id}`}
          aria-label={`${genre.name} 자세히 보기`}
          style={{ textDecoration: 'none' }}
        >
          <span>자세히 보기</span>
          <span className={styles.ctaBtnArrow}>→</span>
        </Link>
      </div>
    </article>
  );
}

export default function GenreSection() {
  const genres = genreData as Genre[];

  return (
    <section className={styles.wrapper} id="genres" aria-label="힙합 서브 장르">
      <div className={styles.sectionLabel}>
        <p>Sub Genres</p>
      </div>

      {genres.map((genre) => (
        <GenreCard key={genre.id} genre={genre} />
      ))}
    </section>
  );
}