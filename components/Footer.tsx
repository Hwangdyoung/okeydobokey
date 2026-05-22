'use client';

import Link from 'next/link';
import styles from '@/styles/Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Link
        href="/"
        className={styles.footerLogo}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'text-shadow 0.3s ease' }}
        onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 10px var(--clr-accent)'}
        onMouseLeave={(e) => e.currentTarget.style.textShadow = 'none'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.1em' }}>
          Okey
          <span style={{ color: 'var(--clr-accent)', display: 'inline-flex', alignItems: 'center' }}>
            <span className={styles.logoIcon}>
              <img src="/do.png" alt="logo icon" style={{ width: '1.6em', height: '1.6em', objectFit: 'contain', display: 'block', margin: '0 -0.7em 0 -0em' }} />
            </span>
          </span>
          Bokey
        </div>
        <span style={{
          fontFamily: 'sans-serif',
          fontSize: '0.3em',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '0.2em',
          fontWeight: 400
        }}>
          오키도보키
        </span>
      </Link>
      <p className={styles.footerText}>
        © {year} OkeyBokey. The culture lives on.
      </p>
    </footer>
  );
}
