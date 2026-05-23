import boombapData from '@/data/boombapData.json';
import ArtistCard from '@/components/ArtistCard';
import PlaylistRecommend from '@/components/PlaylistRecommend';
import styles from '@/styles/Trap.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Boom Bap Genre | OkeyBokey',
  description: '붐뱁(Boom Bap) 장르 상세 가이드',
};

export default function BoombapGenrePage() {
  return (
    <main className={`${styles.main} gridBackground`}>
      <div style={{ paddingTop: '90px', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto', marginBottom: '1rem' }}>
        <Link href="/" className={styles.backLink}>← 뒤로 가기</Link>
      </div>

      <section className={styles.introSection}>
        <div className={styles.introContent}>
          <p className={styles.eyebrow}>GENRE GUIDE</p>
          <h1 className={styles.title}>BOOM BAP</h1>
          <p className={styles.description}>{boombapData.description}</p>
        </div>
      </section>

      <section className={styles.subGenreSection}>
        <h2 className={styles.sectionTitle}>붐뱁의 세부 스타일</h2>
        <div className={styles.gridContainer}>
          {boombapData.subGenres.map((sub) => (
            <div key={sub.id} className={styles.subCard}>
              <h3>{sub.name}</h3>
              <p className={styles.subDesc}>{sub.description}</p>
              <span className={styles.subArtists}>{sub.artists}</span>
            </div>
          ))}
        </div>
      </section>

      <PlaylistRecommend subGenres={boombapData.subGenres} genre="boombap" />

      <section className={styles.artistSection}>
        <h2 className={styles.sectionTitle}>대표 아티스트</h2>
        <div className={styles.artistList}>
          {boombapData.artists.map((artist, index) => (
            <ArtistCard key={artist.id} artist={artist} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
