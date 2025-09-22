import manifestJson from "../generated/image-manifest.json" assert { type: "json" };

export type ImageVariant = {
  width: number;
  height: number;
  bytes: number;
  aspectRatio: number;
  src: string;
};

export type ImageEntry = {
  slug: string;
  documentId: string;
  documentUid: string | null;
  order: number;
  caption: string | null;
  credits: string | null;
  alt: string | null;
  hash: string;
  variants: ImageVariant[];
};

export type CollectionEntry = {
  slug: string;
  title: string | null;
  description: string | null;
  order: number | null;
  images: ImageEntry[];
};

export type ImageManifest = {
  generatedAt: string | null;
  widths: number[];
  collections: Record<string, CollectionEntry>;
};

export type NavigationDirection = "forward" | "backward";

export type PreloadLinkDescriptor = {
  rel: "preload";
  as: "image";
  href: string;
  imagesrcset: string;
  imagesizes: string;
  type: string;
};

export type ImageSourceOptions = {
  sizes?: string;
  direction?: NavigationDirection;
  loop?: boolean;
  preferLargest?: boolean;
};

export type ImageSource = {
  src: string;
  srcSet: string;
  sizes: string;
  hash: string;
  width: number;
  height: number;
  image: ImageEntry;
  collection: CollectionEntry;
  preload?: PreloadLinkDescriptor | null;
};

type ManifestInput = {
  generatedAt?: unknown;
  widths?: unknown;
  collections?: Record<string, unknown> | null;
};

const manifest: ImageManifest = normalizeManifest(manifestJson as ManifestInput);

function normalizeManifest(data: ManifestInput): ImageManifest {
  const generatedAt = typeof data.generatedAt === "string" ? data.generatedAt : null;
  const widths = Array.isArray(data.widths)
    ? data.widths
        .map((value) => toNumeric(value))
        .filter((value): value is number => value !== null)
        .sort((a, b) => a - b)
    : [];

  const collections: Record<string, CollectionEntry> = {};

  if (data.collections && typeof data.collections === "object") {
    for (const [slug, rawEntry] of Object.entries(data.collections)) {
      if (!rawEntry || typeof rawEntry !== "object") {
        continue;
      }

      const entry = normalizeCollection(slug, rawEntry as Record<string, unknown>);
      collections[entry.slug] = entry;
    }
  }

  return {
    generatedAt,
    widths,
    collections
  };
}

function normalizeCollection(slug: string, data: Record<string, unknown>): CollectionEntry {
  const normalizedSlug = asNonEmptyString(data.slug) ?? slug;
  const title = asOptionalString(data.title);
  const description = asOptionalString(data.description);
  const order = toNumeric(data.order);
  const imagesRaw = Array.isArray(data.images) ? (data.images as unknown[]) : [];
  const images = imagesRaw
    .map((value, index) => normalizeImage(value, index))
    .filter((value): value is ImageEntry => value !== null);

  images.sort(sortImages);

  return {
    slug: normalizedSlug,
    title,
    description,
    order,
    images
  };
}

function normalizeImage(raw: unknown, index: number): ImageEntry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const slug = asNonEmptyString(data.slug) ?? `image-${index + 1}`;
  const documentId = asNonEmptyString(data.documentId) ?? slug;
  const documentUid = asOptionalString(data.documentUid);
  const caption = asOptionalString(data.caption);
  const credits = asOptionalString(data.credits);
  const alt = asOptionalString(data.alt);
  const order = toNumeric(data.order) ?? index;
  const hash = asNonEmptyString(data.hash) ?? "";
  const variantsRaw = Array.isArray(data.variants) ? (data.variants as unknown[]) : [];
  const variants = variantsRaw
    .map((variant) => normalizeVariant(variant))
    .filter((variant): variant is ImageVariant => variant !== null)
    .sort((a, b) => a.width - b.width);

  if (variants.length === 0) {
    return null;
  }

  return {
    slug,
    documentId,
    documentUid,
    order,
    caption,
    credits,
    alt,
    hash,
    variants
  };
}

function normalizeVariant(raw: unknown): ImageVariant | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const width = toNumeric(data.width);
  const height = toNumeric(data.height);
  const bytes = toNumeric(data.bytes) ?? 0;
  const src = asNonEmptyString(data.src);
  const aspectRatio = toNumeric(data.aspectRatio);

  if (!width || !height || !src) {
    return null;
  }

  return {
    width,
    height,
    bytes,
    aspectRatio: aspectRatio ?? (height > 0 ? width / height : width),
    src
  };
}

function sortImages(a: ImageEntry, b: ImageEntry): number {
  if (a.order !== b.order) {
    return a.order - b.order;
  }

  return a.slug.localeCompare(b.slug);
}

function sortCollections(a: CollectionEntry, b: CollectionEntry): number {
  const orderA = a.order ?? Number.POSITIVE_INFINITY;
  const orderB = b.order ?? Number.POSITIVE_INFINITY;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return a.slug.localeCompare(b.slug);
}

function asOptionalString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return null;
}

function asNonEmptyString(value: unknown): string | null {
  const optional = asOptionalString(value);
  return optional && optional.length > 0 ? optional : null;
}

function toNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function copyVariant(variant: ImageVariant): ImageVariant {
  return { ...variant };
}

function copyImage(image: ImageEntry): ImageEntry {
  return {
    ...image,
    variants: image.variants.map(copyVariant)
  };
}

function copyCollection(entry: CollectionEntry): CollectionEntry {
  return {
    ...entry,
    images: entry.images.map(copyImage)
  };
}

function copyManifest(data: ImageManifest): ImageManifest {
  const collections: Record<string, CollectionEntry> = {};
  for (const [slug, entry] of Object.entries(data.collections)) {
    collections[slug] = copyCollection(entry);
  }

  return {
    generatedAt: data.generatedAt,
    widths: data.widths.slice(),
    collections
  };
}

function buildSrcSet(variants: ImageVariant[]): string {
  return variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");
}

function resolvePrimaryVariant(variants: ImageVariant[], preferLargest: boolean): ImageVariant {
  return preferLargest ? variants[variants.length - 1] : variants[0];
}

function resolvePreload(
  collection: CollectionEntry,
  currentIndex: number,
  direction: NavigationDirection,
  sizes: string,
  loop: boolean
): PreloadLinkDescriptor | null {
  if (collection.images.length <= 1) {
    return null;
  }

  let targetIndex = direction === "backward" ? currentIndex - 1 : currentIndex + 1;

  if (loop) {
    const total = collection.images.length;
    targetIndex = (targetIndex + total) % total;
  }

  if (targetIndex < 0 || targetIndex >= collection.images.length) {
    return null;
  }

  const targetImage = collection.images[targetIndex];
  if (!targetImage || targetImage.variants.length === 0) {
    return null;
  }

  return {
    rel: "preload",
    as: "image",
    href: targetImage.variants[targetImage.variants.length - 1].src,
    imagesrcset: buildSrcSet(targetImage.variants),
    imagesizes: sizes,
    type: "image/jpeg"
  };
}

export function getManifest(): ImageManifest {
  return copyManifest(manifest);
}

export function getCollections(): CollectionEntry[] {
  return Object.values(manifest.collections)
    .map(copyCollection)
    .sort(sortCollections);
}

export function getCollection(slug: string): CollectionEntry | undefined {
  const entry = manifest.collections[slug];
  return entry ? copyCollection(entry) : undefined;
}

export function getCollectionImage(
  collectionSlug: string,
  imageSlug: string
): { collection: CollectionEntry; image: ImageEntry; index: number } | undefined {
  const collection = manifest.collections[collectionSlug];
  if (!collection) {
    return undefined;
  }

  const index = collection.images.findIndex((image) => image.slug === imageSlug);
  if (index === -1) {
    return undefined;
  }

  const image = collection.images[index];

  return {
    collection: copyCollection(collection),
    image: copyImage(image),
    index
  };
}

export function getImageSources(
  collectionSlug: string,
  imageSlug: string,
  options: ImageSourceOptions = {}
): ImageSource | undefined {
  const record = manifest.collections[collectionSlug];
  if (!record) {
    return undefined;
  }

  const index = record.images.findIndex((image) => image.slug === imageSlug);
  if (index === -1) {
    return undefined;
  }

  const image = record.images[index];
  if (image.variants.length === 0) {
    return undefined;
  }

  const sizes = options.sizes ?? "100vw";
  const preferLargest = options.preferLargest ?? false;
  const primaryVariant = resolvePrimaryVariant(image.variants, preferLargest);
  const srcSet = buildSrcSet(image.variants);
  const preload = resolvePreload(
    record,
    index,
    options.direction ?? "forward",
    sizes,
    options.loop ?? false
  );

  return {
    src: primaryVariant.src,
    srcSet,
    sizes,
    hash: image.hash,
    width: primaryVariant.width,
    height: primaryVariant.height,
    image: copyImage(image),
    collection: copyCollection(record),
    preload
  };
}

export function getNextImageSlug(
  collectionSlug: string,
  imageSlug: string,
  direction: NavigationDirection = "forward",
  loop = false
): string | undefined {
  const collection = manifest.collections[collectionSlug];
  if (!collection) {
    return undefined;
  }

  const index = collection.images.findIndex((image) => image.slug === imageSlug);
  if (index === -1) {
    return undefined;
  }

  let targetIndex = direction === "backward" ? index - 1 : index + 1;

  if (loop) {
    const total = collection.images.length;
    targetIndex = (targetIndex + total) % total;
  }

  if (targetIndex < 0 || targetIndex >= collection.images.length) {
    return undefined;
  }

  return collection.images[targetIndex]?.slug;
}
