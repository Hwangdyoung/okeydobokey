'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './BackButton.module.css';

interface BackButtonProps {
  className?: string;
  targetHref?: string;
}

export default function BackButton({ className, targetHref }: BackButtonProps) {
  const router = useRouter();

  if (targetHref) {
    return (
      <Link href={targetHref} className={`${styles.backBtn} ${className || ''}`}>
        <span className={styles.arrow}>←</span> 뒤로 가기
      </Link>
    );
  }

  return (
    <button 
      onClick={() => router.back()} 
      className={`${styles.backBtn} ${className || ''}`}
    >
      <span className={styles.arrow}>←</span> 뒤로 가기
    </button>
  );
}
