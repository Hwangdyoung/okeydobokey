'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/FloatingDock.module.css';

/* SVG Icons */
const IconIntro = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconSchedule = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconCommunity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const dockItems = [
  {
    id: 'intro',
    label: '소개',
    tooltip: 'Introduction',
    href: '/',
    icon: <IconIntro />,
  },
  {
    id: 'schedule',
    label: '공연일정',
    tooltip: 'Schedule',
    href: '/schedule',
    icon: <IconSchedule />,
  },
  {
    id: 'community',
    label: '커뮤니티',
    tooltip: 'Community',
    href: '/community',
    icon: <IconCommunity />,
  },
];

export default function FloatingDock() {
  const pathname = usePathname();

  return (
    <nav className={styles.floatingDock} aria-label="플로팅 네비게이션" role="navigation">
      <p className={styles.dockLabel}>Nav</p>

      {dockItems.map((item) => {
        // 루트 경로는 정확히 일치할 때만, 나머지는 시작 부분 일치 여부로 active 판단
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            id={`dock-btn-${item.id}`}
            className={`${styles.dockBtn} ${isActive ? styles.active : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            title={item.label}
          >
            {isActive && <span className={styles.dockDot} />}
            <span className={styles.dockIcon}>{item.icon}</span>
            <span className={styles.dockTooltip}>{item.tooltip}</span>
          </Link>
        );
      })}
    </nav>
  );
}
