'use client';

import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import styles from './DynamicCursor.module.css';

const springConfig = { stiffness: 240, damping: 28, mass: 0.35 };

const INTERACTIVE_SELECTOR = '[data-cursor-label],a,button,[role="button"],label';

function extractLabel(node: HTMLElement | null): string | null {
  if (!node) return null;
  const interactive = node.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  if (!interactive) return null;
  const fromDataset = interactive.dataset.cursorLabel;
  const aria = interactive.getAttribute('aria-label');
  const text = interactive.textContent?.trim();
  const label = fromDataset || aria || text;
  return label ? label.replace(/\s+/g, ' ').trim() : null;
}

export default function DynamicCursor() {
  const x = useSpring(useMotionValue(-100), springConfig);
  const y = useSpring(useMotionValue(-100), springConfig);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(pointer: fine)');
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };

    const handleLeave = () => setVisible(false);

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const nextLabel = extractLabel(target);
      setLabel(nextLabel);
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const related = event.relatedTarget as HTMLElement | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        if (related && related.closest(INTERACTIVE_SELECTOR)) {
          return;
        }
      }
      setLabel(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerdown', handleMove);
    window.addEventListener('blur', handleLeave);
    document.addEventListener('pointerleave', handleLeave);
    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointerout', handlePointerOut);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleMove);
      window.removeEventListener('blur', handleLeave);
      document.removeEventListener('pointerleave', handleLeave);
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerout', handlePointerOut);
    };
  }, [enabled, x, y]);

  const labelNode = useMemo(() => {
    if (!label) return null;
    return label.length > 36 ? `${label.slice(0, 33)}…` : label;
  }, [label]);

  if (!enabled) return null;

  return (
    <motion.div
      className={styles.cursor}
      style={{ x, y, opacity: visible ? 1 : 0 }}
      aria-hidden
    >
      <div className={styles.inner}>
        <span className={styles.dot} />
        <AnimatePresence mode="wait">
          {labelNode && (
            <motion.span
              key={labelNode}
              className={styles.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              {labelNode}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
