'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './CollectionHeader.module.css';
import type { CollectionMetadataEntry } from '@/lib/prismic';

interface CollectionHeaderProps {
  title: string;
  summary?: string;
  descriptionHtml?: string;
  metadata?: CollectionMetadataEntry[];
  currentIndex: number;
  total: number;
  thumbnailsOpen: boolean;
  onToggleThumbnails: () => void;
}

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
};

export default function CollectionHeader({
  title,
  summary,
  descriptionHtml,
  metadata,
  currentIndex,
  total,
  thumbnailsOpen,
  onToggleThumbnails
}: CollectionHeaderProps) {
  return (
    <motion.header
      className={styles.header}
      initial={fade.initial}
      animate={fade.animate}
      transition={fade.transition}
    >
      <div className={styles.topRow}>
        <Link href="/" className={styles.backLink} data-cursor-label="Indice">
          Torna all&apos;indice
        </Link>
        <div className={styles.counter} aria-live="polite">
          <strong>{String(currentIndex + 1).padStart(2, '0')}</strong>
          {' / '}
          {String(total).padStart(2, '0')}
        </div>
      </div>

      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{title}</h1>
        {summary && <p className={styles.summary}>{summary}</p>}
      </div>

      {descriptionHtml && (
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      )}

      {metadata && metadata.length > 0 && (
        <dl className={styles.metadata}>
          {metadata.map((entry) => (
            <div key={`${entry.label}-${entry.value}`}>
              <dt>{entry.label}</dt>
              <dd>{entry.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.toggleButton} ${thumbnailsOpen ? styles.toggleButtonActive : ''}`.trim()}
          onClick={onToggleThumbnails}
          data-cursor-label={thumbnailsOpen ? 'Chiudi miniature' : 'Apri miniature'}
          aria-pressed={thumbnailsOpen}
        >
          {thumbnailsOpen ? 'Nascondi miniature' : 'Mostra miniature'}
        </button>
      </div>
    </motion.header>
  );
}
