'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/Trap.module.css';

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    realName: string;
    agency: string;
    debut: string;
    hits: string;
    features: string;
    image?: string;
  };
  index: number;
}

export default function ArtistCard({ artist, index }: ArtistCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`${styles.artistCard} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className={styles.artistImageWrap}>
        {artist.image && !imgError ? (
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            sizes="200px"
            className={styles.artistImage}
            style={{ filter: 'grayscale(100%)' }}
            priority={index < 3}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={styles.artistInitial}>{artist.name.charAt(0)}</span>
        )}
      </div>
      <div className={styles.artistInfo}>
        <h3>{artist.name}</h3>
        <p className={styles.artistAgency}>{artist.agency}</p>
        <p className={styles.artistHits}>{artist.hits}</p>
      </div>
    </div>
  );
}