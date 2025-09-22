'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CollectionHeader from './CollectionHeader';
import GalleryViewer from './GalleryViewer';
import ThumbnailStrip from './ThumbnailStrip';
import styles from './CollectionPageClient.module.css';
import type { ResolvedCollection } from '@/lib/prismic';

interface CollectionPageClientProps {
  collection: ResolvedCollection;
  initialIndex: number;
}

export default function CollectionPageClient({
  collection,
  initialIndex
}: CollectionPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const total = collection.gallery.length;
  const [activeIndex, setActiveIndex] = useState(() => clamp(initialIndex, total));
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(clamp(initialIndex, total));
  }, [initialIndex, total]);

  useEffect(() => {
    setThumbnailsOpen(false);
  }, [collection.slug]);

  useEffect(() => {
    const param = searchParams?.get('p');
    if (!param) {
      if (activeIndex !== 0) {
        setActiveIndex(0);
      }
      return;
    }
    const parsed = Number.parseInt(param, 10);
    const next = Number.isFinite(parsed) ? clamp(parsed - 1, total) : 0;
    if (next !== activeIndex) {
      setActiveIndex(next);
    }
  }, [activeIndex, searchParams, total]);

  const updateUrl = useCallback(
    (index: number) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (index > 0) {
        params.set('p', String(index + 1));
      } else {
        params.delete('p');
      }
      const query = params.toString();
      const target = query ? `${pathname}?${query}` : pathname;
      router.replace(target, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleIndexChange = useCallback(
    (index: number) => {
      const next = clamp(index, total);
      setActiveIndex(next);
      updateUrl(next);
    },
    [total, updateUrl]
  );

  const handleSelectFromStrip = useCallback(
    (index: number) => {
      handleIndexChange(index);
    },
    [handleIndexChange]
  );

  const handleToggleThumbnails = useCallback(() => {
    setThumbnailsOpen((value) => !value);
  }, []);

  const handleExit = useCallback(() => {
    router.push('/', { scroll: false });
  }, [router]);

  return (
    <div className={styles.container}>
      <CollectionHeader
        title={collection.title}
        summary={collection.summary}
        descriptionHtml={collection.descriptionHtml}
        metadata={collection.metadata}
        currentIndex={activeIndex}
        total={total}
        thumbnailsOpen={thumbnailsOpen}
        onToggleThumbnails={handleToggleThumbnails}
      />
      <GalleryViewer
        images={collection.gallery}
        initialIndex={activeIndex}
        onIndexChange={handleIndexChange}
        onExit={handleExit}
      />
      <ThumbnailStrip
        images={collection.gallery}
        activeIndex={activeIndex}
        isOpen={thumbnailsOpen}
        onSelect={handleSelectFromStrip}
      />
    </div>
  );
}

function clamp(index: number, total: number) {
  if (total === 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(total - 1, index));
}
