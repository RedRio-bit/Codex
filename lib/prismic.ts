import * as prismic from '@prismicio/client';

export interface CollectionMetadataEntry {
  label: string;
  value: string;
}

export interface GalleryImageDetail {
  label: string;
  value: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  descriptionHtml?: string;
  thumbnailUrl?: string;
  details?: GalleryImageDetail[];
}

export interface ResolvedCollection {
  slug: string;
  title: string;
  summary?: string;
  descriptionHtml?: string;
  metadata: CollectionMetadataEntry[];
  gallery: GalleryImage[];
  order: number;
}

export interface CollectionSummary {
  slug: string;
  title: string;
  summary?: string;
  count: number;
  order: number;
}

const repositoryName =
  process.env.PRISMIC_REPOSITORY_NAME ?? process.env.NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME ?? '';

const FALLBACK_COLLECTIONS: ResolvedCollection[] = [
  {
    slug: 'work-01',
    title: 'Linee di Ombra',
    summary: 'Roma, 2021',
    descriptionHtml:
      '<p>Sequenza di camminate all\'alba tra i quartieri Ostiense e Garbatella: superfici industriali illuminate dalle prime luci e sagome di passanti distratti.</p>',
    metadata: [
      { label: 'Luogo', value: 'Roma, Italia' },
      { label: 'Anno', value: '2021' },
      { label: 'Pellicola', value: 'Kodak Portra 400' }
    ],
    order: 1,
    gallery: [
      {
        id: 'work-01-1',
        url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=60',
        alt: 'Strada bagnata illuminata dal sole nascente',
        caption: 'Linea di luce lungo via Ostiense',
        width: 2000,
        height: 1333
      },
      {
        id: 'work-01-2',
        url: 'https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?auto=format&fit=crop&w=2000&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1529119368496-2dfda6ec2804?auto=format&fit=crop&w=400&q=60',
        alt: 'Silhouette di una persona davanti a una vetrata industriale',
        caption: 'Turno di notte alla Centrale Montemartini',
        width: 2000,
        height: 1333
      },
      {
        id: 'work-01-3',
        url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2000&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=60',
        alt: 'Parete colorata con geometrie di luce',
        caption: 'Garbatella, le geometrie del mattino',
        width: 2000,
        height: 1333
      },
      {
        id: 'work-01-4',
        url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2400&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=60',
        alt: 'Scorcio di cortile romano con vegetazione',
        caption: 'Una pausa tra i cortili',
        width: 2400,
        height: 1600
      }
    ]
  },
  {
    slug: 'work-07',
    title: 'Perimetro Notturno',
    summary: 'Milano, 2022',
    descriptionHtml:
      '<p>Uno studio sui limiti della città al calare della notte: recinzioni, fari al sodio e tracce di passaggi recenti.</p>',
    metadata: [
      { label: 'Luogo', value: 'Milano, Italia' },
      { label: 'Anno', value: '2022' },
      { label: 'Attrezzatura', value: 'Fujifilm X100V' }
    ],
    order: 7,
    gallery: [
      {
        id: 'work-07-1',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=60',
        alt: 'Illuminazione arancione su strada notturna',
        caption: 'Lamiera e neon in periferia',
        width: 2000,
        height: 1333
      },
      {
        id: 'work-07-2',
        url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=60',
        alt: 'Parcheggio illuminato con persone che passano',
        caption: 'Il turno del custode',
        width: 2200,
        height: 1466
      },
      {
        id: 'work-07-3',
        url: 'https://images.unsplash.com/photo-1526481280695-3c4692f9c1c1?auto=format&fit=crop&w=2100&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1526481280695-3c4692f9c1c1?auto=format&fit=crop&w=400&q=60',
        alt: 'Catena metallica e luce al sodio',
        caption: 'Perimetro 3B',
        width: 2100,
        height: 1400
      }
    ]
  },
  {
    slug: 'work-13',
    title: 'Attraversamenti',
    summary: 'Palermo, 2020',
    descriptionHtml:
      '<p>Piccole storie di viaggio tra porto e centro storico. Ogni scatto è un frammento di conversazioni notturne.</p>',
    metadata: [
      { label: 'Luogo', value: 'Palermo, Italia' },
      { label: 'Anno', value: '2020' },
      { label: 'Formato', value: '6x7' }
    ],
    order: 13,
    gallery: [
      {
        id: 'work-13-1',
        url: 'https://images.unsplash.com/photo-1526481280695-3c4692f9c1c1?auto=format&fit=crop&w=2100&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1526481280695-3c4692f9c1c1?auto=format&fit=crop&w=400&q=60',
        alt: 'Donna che cammina con valigia in controluce',
        caption: 'Scalo merci',
        width: 2100,
        height: 1400
      },
      {
        id: 'work-13-2',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2100&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=60',
        alt: 'Taxi giallo con luci al neon',
        caption: 'Rotatoria del porto',
        width: 2100,
        height: 1400
      },
      {
        id: 'work-13-3',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=60',
        alt: 'Coppia che attraversa un passaggio pedonale',
        caption: 'Ultima corsa',
        width: 2000,
        height: 1333
      }
    ]
  }
];

function getClient() {
  if (!repositoryName) return null;
  try {
    return prismic.createClient(repositoryName, {
      accessToken: process.env.PRISMIC_ACCESS_TOKEN || undefined,
      fetchOptions: {
        next: { revalidate: 60 },
        cache: 'no-store'
      }
    });
  } catch (error) {
    console.warn('Impossibile creare il client Prismic:', error);
    return null;
  }
}

function parseOrder(value: unknown, fallback: number) {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pickThumbnail(image: any): string | undefined {
  if (!image) return undefined;
  if (typeof image.thumbnail_url === 'string') return image.thumbnail_url;
  if (typeof image.thumbnailUrl === 'string') return image.thumbnailUrl;
  if (image.thumbnails) {
    const thumbnails = Object.values(image.thumbnails) as Array<{ url?: string }>;
    const thumb = thumbnails.find((item) => typeof item?.url === 'string');
    if (thumb?.url) return thumb.url;
  }
  if (typeof image.url === 'string') return image.url;
  return undefined;
}

function parseImageDetails(item: Record<string, any>): GalleryImageDetail[] | undefined {
  const details: GalleryImageDetail[] = [];
  for (const [key, raw] of Object.entries(item)) {
    if (key === 'image' || key === 'immagine' || key === 'caption') continue;
    if (raw == null) continue;
    if (typeof raw === 'string' && raw.trim().length > 0) {
      details.push({ label: key.replace(/_/g, ' '), value: raw });
    }
  }
  return details.length ? details : undefined;
}

function parseCollection(document: prismic.PrismicDocument<Record<string, any>>): ResolvedCollection | null {
  const slug = document.uid || document.slugs?.[0] || document.id;
  if (!slug) return null;

  const titleField = document.data?.title as prismic.RichTextField | string | undefined;
  const title =
    (Array.isArray(titleField) ? prismic.asText(titleField) : titleField) || document.data?.name || slug;

  const summaryField = document.data?.summary ?? document.data?.subtitle;
  const summary =
    typeof summaryField === 'string' && summaryField.trim().length > 0
      ? summaryField.trim()
      : Array.isArray(summaryField)
      ? prismic.asText(summaryField as prismic.RichTextField)
      : undefined;

  const descriptionField = document.data?.description ?? document.data?.body;
  const descriptionHtml = Array.isArray(descriptionField)
    ? prismic.asHTML(descriptionField as prismic.RichTextField)
    : typeof descriptionField === 'string'
    ? descriptionField
    : undefined;

  const order = parseOrder(document.data?.order ?? document.data?.index, FALLBACK_COLLECTIONS.length + 1);

  const metadata: CollectionMetadataEntry[] = [];
  const metadataGroup = document.data?.metadata ?? document.data?.meta;
  if (Array.isArray(metadataGroup)) {
    for (const row of metadataGroup) {
      const label = (row?.label || row?.titolo || '').toString().trim();
      const value = (row?.value || row?.valore || '').toString().trim();
      if (label && value) {
        metadata.push({ label, value });
      }
    }
  }

  const candidateKeys = ['location', 'luogo', 'year', 'anno', 'camera', 'attrezzatura', 'format', 'formato'];
  for (const key of candidateKeys) {
    const raw = document.data?.[key];
    if (typeof raw === 'string' && raw.trim()) {
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
      if (!metadata.some((entry) => entry.label === label)) {
        metadata.push({ label, value: raw.trim() });
      }
    }
  }

  if (document.tags?.length) {
    metadata.push({ label: 'Tag', value: document.tags.join(', ') });
  }

  const galleryRaw = (document.data?.gallery ?? document.data?.media ?? []) as Array<Record<string, any>>;
  const gallery: GalleryImage[] = [];
  galleryRaw.forEach((item, index) => {
    const image = item?.image || item?.immagine || item;
    if (!image || typeof image.url !== 'string') return;
    const alt = image.alt || `${title} — scatto ${index + 1}`;
    const captionField = item?.caption ?? item?.didascalia;
    const caption = Array.isArray(captionField)
      ? prismic.asText(captionField as prismic.RichTextField)
      : typeof captionField === 'string'
      ? captionField
      : undefined;
    const descriptionHtml = Array.isArray(captionField)
      ? prismic.asHTML(captionField as prismic.RichTextField)
      : undefined;

    gallery.push({
      id: `${slug}-${index}`,
      url: image.url,
      alt,
      width: image.dimensions?.width,
      height: image.dimensions?.height,
      caption,
      descriptionHtml,
      thumbnailUrl: pickThumbnail(image),
      details: parseImageDetails(item)
    });
  });

  if (!gallery.length) {
    return null;
  }

  return {
    slug,
    title,
    summary,
    descriptionHtml,
    metadata,
    gallery,
    order
  };
}

export async function getCollectionsIndex(): Promise<CollectionSummary[]> {
  const client = getClient();
  if (client) {
    try {
      const documents = await client.getAllByType('collection', {
        orderings: [{ field: 'my.collection.order', direction: 'asc' }],
        pageSize: 100
      });
      const parsed = documents
        .map((doc) => {
          const collection = parseCollection(doc as prismic.PrismicDocument<Record<string, any>>);
          if (!collection) return null;
          return {
            slug: collection.slug,
            title: collection.title,
            summary: collection.summary,
            count: collection.gallery.length,
            order: collection.order
          } satisfies CollectionSummary;
        })
        .filter((value): value is CollectionSummary => Boolean(value));
      if (parsed.length) {
        return parsed.sort((a, b) => a.order - b.order);
      }
    } catch (error) {
      console.warn('Impossibile caricare la lista delle collezioni da Prismic:', error);
    }
  }

  return FALLBACK_COLLECTIONS.map((collection) => ({
    slug: collection.slug,
    title: collection.title,
    summary: collection.summary,
    count: collection.gallery.length,
    order: collection.order
  })).sort((a, b) => a.order - b.order);
}

export async function getCollection(slug: string): Promise<ResolvedCollection | null> {
  const client = getClient();
  if (client) {
    try {
      const document = await client.getByUID('collection', slug, {
        fetchLinks: []
      });
      const parsed = parseCollection(document as prismic.PrismicDocument<Record<string, any>>);
      if (parsed) return parsed;
    } catch (error: any) {
      if (error?.status !== 404) {
        console.warn(`Errore durante il caricamento della collezione ${slug}:`, error);
      }
    }
  }

  const fallback = FALLBACK_COLLECTIONS.find((item) => item.slug === slug);
  return fallback ?? null;
}

export async function getCollectionSlugs(): Promise<string[]> {
  const client = getClient();
  if (client) {
    try {
      const documents = await client.getAllByType('collection', {
        fetch: ['uid']
      });
      const slugs = documents
        .map((doc) => doc.uid || doc.slugs?.[0])
        .filter((value): value is string => Boolean(value));
      if (slugs.length) {
        return slugs;
      }
    } catch (error) {
      console.warn('Impossibile recuperare le route statiche da Prismic:', error);
    }
  }

  return FALLBACK_COLLECTIONS.map((collection) => collection.slug);
}
