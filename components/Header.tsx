'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/Header.module.css';

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // 스크롤 중에는 헤더를 숨김
      setIsVisible(false);

      // 기존 타이머 취소
      clearTimeout(scrollTimeout);

      // 스크롤이 멈추면 150ms 후에 헤더를 다시 표시
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const navItems = [
    { label: '소개', href: '/' },
    { label: '공연일정', href: '/schedule' },
    { label: '커뮤니티', href: '/community' },
    { label: '취향 분석 플리', href: '/recommend' },
    { label: '내정보', href: '/profile' }
  ];

  return (
    <header className={`${styles.header} ${isVisible ? styles.visible : styles.hidden}`}>
      <div className={styles.headerContainer}>
        {/* 로고 영역 */}
        <Link href="/" className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span>Okey</span>
          <span className={styles.logoIcon}>
            <img src="/do.png" alt="logo icon" style={{ width: '1.6em', height: '1.6em', objectFit: 'contain', display: 'block', margin: '0 -0.5em 0 -0em' }} />
          </span>
          <span>Bokey</span>
        </Link>

        {/* 네비게이션 메뉴 */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
