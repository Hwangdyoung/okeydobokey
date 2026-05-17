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
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div 
      ref={cardRef} 
      className={`${styles.artistCard} ${isEven ? styles.even : styles.odd} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.artistImagePlaceholder}>
        <div className={styles.imageInner}>
          {artist.image && !imgError ? (
            <Image 
              src={artist.image} 
              alt={artist.name} 
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className={styles.artistImage}
              priority={index < 2}
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{artist.name.charAt(0)}</span>
          )}
        </div>
      </div>
      <div className={styles.artistInfo}>
        <h3>{artist.name}</h3>
        <ul className={styles.infoList}>
          <li><strong>본명:</strong> {artist.realName}</li>
          <li><strong>소속:</strong> {artist.agency}</li>
          <li><strong>데뷔:</strong> {artist.debut}</li>
          <li><strong>대표곡/앨범:</strong> {artist.hits}</li>
        </ul>
        <p className={styles.artistFeatures}>{artist.features}</p>
      </div>
    </div>
  );
}
