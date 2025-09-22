'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import styles from './ThumbnailStrip.module.css';
import type { GalleryImage } from '@/lib/prismic';

interface ThumbnailStripProps {
  images: GalleryImage[];
  activeIndex: number;
  isOpen: boolean;
  onSelect: (index: number) => void;
}

export default function ThumbnailStrip({
  images,
  activeIndex,
  isOpen,
  onSelect
}: ThumbnailStripProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!isOpen) return;
    const node = refs.current[activeIndex];
    node?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIndex, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.wrapper}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        >
          <div className={styles.track}>
            {images.map((image, index) => (
              <button
                key={image.id}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                type="button"
                className={`${styles.thumbButton} ${index === activeIndex ? styles.thumbActive : ''}`.trim()}
                onClick={() => onSelect(index)}
                data-cursor-label={`Vai a ${index + 1}`}
                aria-current={index === activeIndex}
                aria-label={`Vai allo scatto ${index + 1}`}
              >
                <img src={image.thumbnailUrl ?? image.url} alt={image.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
