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

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      inner.style.left = `${x}px`;
      inner.style.top = `${y}px`;
      outer.style.left = `${x}px`;
      outer.style.top = `${y}px`;
      inner.style.opacity = '1';
      outer.style.opacity = '1';
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea' ||
        !!target.closest('a') ||
        !!target.closest('button') ||
        !!target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (isClickable) {
        inner.classList.add('hover');
        outer.classList.add('hover');
      } else {
        inner.classList.remove('hover');
        outer.classList.remove('hover');
      }
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
    window.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
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