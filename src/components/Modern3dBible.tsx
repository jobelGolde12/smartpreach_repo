'use client';

import { useEffect, useRef } from 'react';
import { ModernBible } from './ModernBible';

interface Modern3dBibleProps {
  className?: string;
}

export default function Modern3dBible({ className = '' }: Modern3dBibleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bibleRef = useRef<ModernBible | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Dynamic import to avoid SSR issues
    const initBible = async () => {
      if (!containerRef.current) return;

      // Import the class
      const { ModernBible } = await import('./ModernBible');

      // Create instance
      const bible = new ModernBible(containerRef.current.id);
      bibleRef.current = bible;
    };

    initBible();

    return () => {
      if (bibleRef.current) {
        bibleRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="modern-3d-bible"
      className={className}
    />
  );
}

