'use client';

import styles from '@/styles/Hero.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      {/* Left decorative text */}
      <div className={styles.heroYear}>
        <p>EST. 1973</p>
      </div>

      {/* Right vertical line */}
      <div className={styles.heroLineRight}>
        <div className={styles.vertLine} />
        <p>Scroll to explore</p>
        <div className={styles.vertLine} />
      </div>

      {/* Main content */}
      <div className={styles.heroContent}>
        <p className={styles.heroEyebrow}>K.Hip-Hop HUB</p>

        <h1
          className={styles.heroTitle}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.1em' }}
        >
          Okey
          <span style={{ color: 'var(--clr-accent)', display: 'inline-flex', alignItems: 'center' }}>
            <span className={styles.logoIcon}>
              <img src="/do.png" alt="logo icon" style={{ width: '1.7em', height: '1.7em', objectFit: 'contain', display: 'block', margin: '-0.6em -0.7em -0.6em 0' }} />
            </span>
          </span>
          Bokey
        </h1>

        {/* 한글 서브타이틀 */}
        <p style={{
          fontFamily: 'sans-serif',
          fontSize: 'clamp(1rem, 2vw, 1.5rem)',
          color: 'rgba(255, 255, 255, 0.4)',
          marginTop: '-0.3em',
          marginBottom: '0.5em',
          letterSpacing: '0.2em',
          fontWeight: 400
        }}>
          오키도보키
        </p>

        <p className={styles.heroSubtitle}>
          Discover the Korean Hip-Hop Scene
        </p>

        <div className={styles.heroTagline}>
          <span />
          <p>Trap · R&B · Drill · Boom Bap</p>
          <span />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse} />
        <span>Scroll</span>
      </div>
    </section>
  );
}
