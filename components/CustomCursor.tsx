'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const inner = innerRef.current;
    const outer = outerRef.current;
    if (!inner || !outer) return;

    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;
        inner.style.left = `${x}px`;
        inner.style.top = `${y}px`;
        outer.style.left = `${x}px`;
        outer.style.top = `${y}px`;

        const target = e.target as HTMLElement;
        const isClickable =
          target.tagName.toLowerCase() === 'a' ||
          target.tagName.toLowerCase() === 'button' ||
          target.tagName.toLowerCase() === 'input' ||
          target.tagName.toLowerCase() === 'textarea' ||
          !!target.closest('a') ||
          !!target.closest('button') ||
          !!target.closest('[role="button"]');

        if (isClickable) {
          inner.classList.add('hover');
          outer.classList.add('hover');
        } else {
          inner.classList.remove('hover');
          outer.classList.remove('hover');
        }

        inner.style.opacity = '1';
        outer.style.opacity = '1';
      });
    };

    const onMouseLeave = () => {
      inner.style.opacity = '0';
      outer.style.opacity = '0';
    };

    const onMouseEnter = () => {
      inner.style.opacity = '1';
      outer.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return (
    <>
      <div ref={innerRef} className="custom-cursor-inner" style={{ opacity: 0 }} />
      <div ref={outerRef} className="custom-cursor-outer" style={{ opacity: 0 }} />
    </>
  );

}