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
            <svg width="0.8em" height="0.8em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
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
