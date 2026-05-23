import trapData from '@/data/trapData.json';
import ArtistCard from '@/components/ArtistCard';
import PlaylistRecommend from '@/components/PlaylistRecommend';
import styles from '@/styles/Trap.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Trap Genre | OkeyBokey',
  description: '트랩(Trap) 장르 상세 가이드',
};

export default function TrapGenrePage() {
  return (
    <main className={`${styles.main} gridBackground`}>
      <div style={{ paddingTop: '90px', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto', marginBottom: '1rem' }}>
        <Link href="/" className={styles.backLink}>
          ← 뒤로 가기
        </Link>
      </div>

      {/* 1. Intro Section */}
      <section className={styles.introSection}>
        <div className={styles.introContent}>
          <p className={styles.eyebrow}>GENRE GUIDE</p>
          <h1 className={styles.title}>TRAP</h1>
          <p className={styles.description}>{trapData.description}</p>
        </div>
      </section>

      {/* 2. Sub-genre Section */}
      <section className={styles.subGenreSection}>
        <h2 className={styles.sectionTitle}>트랩의 세부 스타일</h2>
        <div className={styles.gridContainer}>
          {trapData.subGenres.map((sub) => (
            <div key={sub.id} className={styles.subCard}>
              <h3>{sub.name}</h3>
              <p className={styles.subDesc}>{sub.description}</p>
              <span className={styles.subArtists}>{sub.artists}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Playlist Section */}
      <PlaylistRecommend subGenres={trapData.subGenres} genre="trap" />

      {/* 4. Artist Profile Section */}
      <section className={styles.artistSection}>
        <h2 className={styles.sectionTitle}>대표 아티스트</h2>
        <div className={styles.artistList}>
          {trapData.artists.map((artist, index) => (
            <ArtistCard key={artist.id} artist={artist} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}