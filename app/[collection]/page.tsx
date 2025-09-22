import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CollectionPageClient from '@/components/CollectionPageClient';
import { getCollection, getCollectionSlugs } from '@/lib/prismic';

interface PageProps {
  params: { collection: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateStaticParams() {
  const slugs = await getCollectionSlugs();
  return slugs.map((slug) => ({ collection: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const collection = await getCollection(params.collection);
  if (!collection) {
    return { title: 'Collezione non trovata — Archivio fotografico' };
  }

  const description =
    collection.summary ||
    (collection.descriptionHtml ? truncate(stripHtml(collection.descriptionHtml), 160) : undefined);

  return {
    title: `${collection.title} — Archivio fotografico`,
    description,
    openGraph: {
      title: `${collection.title} — Archivio fotografico`,
      description,
      images:
        collection.gallery.length > 0
          ? [
              {
                url: collection.gallery[0].url,
                width: collection.gallery[0].width,
                height: collection.gallery[0].height,
                alt: collection.gallery[0].alt
              }
            ]
          : undefined
    }
  } satisfies Metadata;
}

export const revalidate = 120;

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const collection = await getCollection(params.collection);
  if (!collection) {
    notFound();
  }

  const rawParam = searchParams?.p;
  const parsed = parseParam(rawParam);
  const initialIndex = clamp(parsed - 1, collection.gallery.length);

  return <CollectionPageClient collection={collection} initialIndex={initialIndex} />;
}

function parseParam(value: string | string[] | undefined) {
  if (!value) return 1;
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(candidate ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return parsed;
}

function clamp(index: number, total: number) {
  if (total === 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(total - 1, index));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}…`;
}
