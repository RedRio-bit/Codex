'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './GalleryViewer.module.css';
import type { GalleryImage } from '@/lib/prismic';
import { useScreensaver } from '@/hooks/useScreensaver';

interface GalleryViewerProps {
  images: GalleryImage[];
  initialIndex: number;
  onIndexChange?: (index: number) => void;
  onExit?: () => void;
}

export default function GalleryViewer({
  images,
  initialIndex,
  onIndexChange,
  onExit
}: GalleryViewerProps) {
  const [current, setCurrent] = useState(() => clampIndex(initialIndex, images.length));
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(current);

  useEffect(() => {
    setCurrent(clampIndex(initialIndex, images.length));
  }, [initialIndex, images.length]);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  const { isActive, nextIndex, registerInteraction } = useScreensaver(images.length, current);

  useEffect(() => {
    if (nextIndex == null || nextIndex === current) return;
    setCurrent(nextIndex);
    onIndexChange?.(nextIndex);
  }, [current, nextIndex, onIndexChange]);

  useEffect(() => {
    if (typeof document === 'undefined' || images.length < 2) return;
    const next = (current + 1) % images.length;
    const url = images[next]?.url;
    if (!url) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [current, images]);

  const goTo = useCallback(
    (index: number) => {
      if (!images.length) return;
      const next = wrapIndex(index, images.length);
      setCurrent(next);
      onIndexChange?.(next);
      registerInteraction();
    },
    [images.length, onIndexChange, registerInteraction]
  );

  const handleNext = useCallback(() => {
    goTo(currentRef.current + 1);
  }, [goTo]);

  const handlePrevious = useCallback(() => {
    goTo(currentRef.current - 1);
  }, [goTo]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        registerInteraction();
        onExit?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, onExit, registerInteraction]);

  const activeImage = images[current];

  const captionDetails = useMemo(() => {
    if (!activeImage?.details?.length) return null;
    return activeImage.details.map((detail) => (
      <span key={`${detail.label}-${detail.value}`}>{`${detail.label}: ${detail.value}`}</span>
    ));
  }, [activeImage?.details]);

  if (!activeImage) {
    return null;
  }

  const handlePointerMove = () => registerInteraction();

  return (
    <div className={styles.viewer}>
      <div
        className={styles.canvas}
        ref={containerRef}
        tabIndex={0}
        onMouseMove={handlePointerMove}
        onTouchStart={handlePointerMove}
      >
        <img src={activeImage.url} alt={activeImage.alt} loading="eager" />

        <div className={styles.interactionLayer}>
          <button
            type="button"
            className={`${styles.navigationZone} ${styles.navigationZoneLeft}`}
            onClick={handlePrevious}
            data-cursor-label="Precedente"
            aria-label="Mostra fotografia precedente"
          />
          <button
            type="button"
            className={`${styles.navigationZone} ${styles.navigationZoneRight}`}
            onClick={handleNext}
            data-cursor-label="Successiva"
            aria-label="Mostra fotografia successiva"
          />
        </div>

        <div className={`${styles.pointerHint} ${styles.pointerHintLeft}`}>← Precedente</div>
        <div className={`${styles.pointerHint} ${styles.pointerHintRight}`}>Successiva →</div>
      </div>

      <div className={styles.caption}>
        {activeImage.caption && <span className={styles.captionTitle}>{activeImage.caption}</span>}
        {captionDetails && <div className={styles.captionDetails}>{captionDetails}</div>}
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            key="screensaver"
            className={styles.screensaverBadge}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            Screensaver attivo
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function wrapIndex(index: number, total: number) {
  if (total === 0) return 0;
  const mod = index % total;
  return mod < 0 ? mod + total : mod;
}

function clampIndex(index: number, total: number) {
  if (total === 0) return 0;
  if (!Number.isFinite(index)) return 0;
  const clamped = Math.max(0, Math.min(total - 1, index));
  return clamped;
}
