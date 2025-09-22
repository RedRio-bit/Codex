#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
import sharp from "sharp";
import * as prismic from "@prismicio/client";

type RichTextNode = { text?: string | null };
type RichTextField = ReadonlyArray<RichTextNode> | null | undefined;

type ContentRelationshipField = {
  id?: string;
  uid?: string | null;
  type?: string;
  link_type?: string | null;
};

type CollectionDocumentData = {
  title?: string | null;
  short_description?: RichTextField;
  order?: number | string | null;
  images?: Array<{
    asset?: ContentRelationshipField | null;
  }> | null;
};

type ImageAssetDocumentData = {
  image?: {
    url?: string | null;
    alt?: string | null;
    dimensions?: {
      width?: number | null;
      height?: number | null;
    } | null;
  } | null;
  caption?: RichTextField;
  credits?: string | null;
  order?: number | string | null;
};

type CollectionDocument = {
  id: string;
  uid: string | null;
  data: CollectionDocumentData;
};

type ImageAssetDocument = {
  id: string;
  uid: string | null;
  data: ImageAssetDocumentData;
};

type ImageVariant = {
  width: number;
  height: number;
  bytes: number;
  aspectRatio: number;
  src: string;
};

type ImageEntry = {
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

type CollectionEntry = {
  slug: string;
  title: string | null;
  description: string | null;
  order: number | null;
  images: ImageEntry[];
};

type ImageManifest = {
  generatedAt: string;
  widths: number[];
  collections: Record<string, CollectionEntry>;
};

type SliceMachineConfig = {
  repositoryName?: string;
  apiEndpoint?: string;
};

const BASE_WIDTHS = [480, 640, 768, 960, 1024, 1280, 1440, 1536, 1600, 1920] as const;
const MAX_WIDTH = 3840;
const WIDTH_PRESET = Array.from(
  new Set<number>([
    ...BASE_WIDTHS,
    ...BASE_WIDTHS.map((width) => width * 2)
  ])
)
  .filter((width) => width > 0 && width <= MAX_WIDTH)
  .sort((a, b) => a - b);

const OUTPUT_ROOT = path.resolve("public", "i");
const MANIFEST_PATH = path.resolve("generated", "image-manifest.json");

const imageBufferCache = new Map<string, Buffer>();

sharp.cache(false);

function toPlainText(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const text = (value as RichTextNode[])
      .map((node) => (typeof node?.text === "string" ? node.text : ""))
      .join("\n")
      .trim();

    return text.length > 0 ? text : null;
  }

  return null;
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

function slugifySegment(value: string | null | undefined, fallback: string): string {
  const candidate = (value ?? "").toString().trim();
  const normalisedCandidate = candidate
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  if (normalisedCandidate.length > 0) {
    return normalisedCandidate;
  }

  const fallbackNormalised = fallback
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return fallbackNormalised.length > 0 ? fallbackNormalised : "asset";
}

function ensureUniqueSlug(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  let index = 2;
  let candidate = `${base}-${index}`;

  while (used.has(candidate)) {
    index += 1;
    candidate = `${base}-${index}`;
  }

  used.add(candidate);
  return candidate;
}

function computeTargetWidths(originalWidth?: number | null): number[] {
  const hasOriginal = typeof originalWidth === "number" && Number.isFinite(originalWidth) && originalWidth > 0;
  const max = hasOriginal ? Math.min(Math.round(originalWidth), MAX_WIDTH) : MAX_WIDTH;
  const widths = new Set<number>();

  for (const preset of WIDTH_PRESET) {
    if (preset <= max) {
      widths.add(preset);
    }
  }

  if (hasOriginal) {
    widths.add(max);
  }

  const result = Array.from(widths)
    .filter((width) => width > 0 && width <= max)
    .sort((a, b) => a - b);

  if (result.length === 0) {
    result.push(hasOriginal ? max : WIDTH_PRESET[0] ?? 480);
  }

  return result;
}

async function loadSliceMachineConfig(): Promise<SliceMachineConfig> {
  const config: SliceMachineConfig = {};

  try {
    const raw = await fs.readFile("slicemachine.config.json", "utf8");
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object") {
      if (typeof parsed.repositoryName === "string") {
        config.repositoryName = parsed.repositoryName;
      }

      if (typeof parsed.apiEndpoint === "string") {
        config.apiEndpoint = parsed.apiEndpoint;
      }
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code && code !== "ENOENT") {
      console.warn("Impossibile leggere slicemachine.config.json:", error);
    }
  }

  if (!config.apiEndpoint) {
    try {
      const raw = await fs.readFile("sm.json", "utf8");
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object" && typeof parsed.apiEndpoint === "string") {
        config.apiEndpoint = parsed.apiEndpoint;
        if (!config.repositoryName) {
          const match = /https?:\/\/([^.]+)\./.exec(parsed.apiEndpoint);
          if (match) {
            config.repositoryName = match[1];
          }
        }
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code && code !== "ENOENT") {
        console.warn("Impossibile leggere sm.json:", error);
      }
    }
  }

  if (!config.apiEndpoint && config.repositoryName) {
    config.apiEndpoint = `https://${config.repositoryName}.cdn.prismic.io/api/v2`;
  }

  return config;
}

async function ensureOutputRoot(): Promise<void> {
  await fs.rm(OUTPUT_ROOT, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const cached = imageBufferCache.get(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download non riuscito per ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  imageBufferCache.set(url, buffer);
  return buffer;
}

async function generateVariants(params: {
  buffer: Buffer;
  collectionSlug: string;
  imageSlug: string;
  originalWidth?: number | null;
  originalHeight?: number | null;
}): Promise<ImageVariant[]> {
  const { buffer, collectionSlug, imageSlug, originalWidth, originalHeight } = params;
  const targetWidths = computeTargetWidths(originalWidth);
  const variants: ImageVariant[] = [];
  const seen = new Set<number>();

  for (const targetWidth of targetWidths) {
    const pipeline = sharp(buffer).resize({
      width: targetWidth,
      fit: "inside",
      withoutEnlargement: true
    });

    const { data, info } = await pipeline.jpeg({
      quality: 82,
      chromaSubsampling: "4:2:0",
      mozjpeg: true,
      progressive: true
    }).toBuffer({ resolveWithObject: true });

    const width = info.width ?? targetWidth;
    if (seen.has(width)) {
      continue;
    }
    seen.add(width);

    const height = info.height ?? (originalWidth && originalHeight && originalWidth > 0
      ? Math.round((width / originalWidth) * originalHeight)
      : width);

    const aspectRatio = height > 0 ? width / height : width;
    const directory = path.join(OUTPUT_ROOT, collectionSlug, `w-${width}`);
    await fs.mkdir(directory, { recursive: true });
    const filePath = path.join(directory, `${imageSlug}.jpg`);
    await fs.writeFile(filePath, data);

    variants.push({
      width,
      height,
      bytes: info.size ?? data.length,
      aspectRatio,
      src: `/i/${collectionSlug}/w-${width}/${imageSlug}.jpg`
    });
  }

  variants.sort((a, b) => a.width - b.width);
  return variants;
}

async function writeManifest(manifest: ImageManifest): Promise<void> {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main(): Promise<void> {
  const sliceMachineConfig = await loadSliceMachineConfig();
  const repositoryName = process.env.PRISMIC_REPOSITORY_NAME ?? sliceMachineConfig.repositoryName;
  const apiEndpoint = process.env.PRISMIC_API_ENDPOINT ?? sliceMachineConfig.apiEndpoint ?? (repositoryName ? `https://${repositoryName}.cdn.prismic.io/api/v2` : null);

  if (!apiEndpoint) {
    throw new Error("Impossibile determinare l'endpoint API di Prismic. Impostare PRISMIC_API_ENDPOINT o repositoryName.");
  }

  const client = prismic.createClient(apiEndpoint, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN || undefined,
    fetch
  });

  await ensureOutputRoot();

  const [collectionsRaw, imageAssetsRaw] = await Promise.all([
    client.getAllByType("collection", { lang: "*" }),
    client.getAllByType("image_asset", { lang: "*" })
  ]);

  const collections = collectionsRaw as unknown as CollectionDocument[];
  const imageAssets = imageAssetsRaw as unknown as ImageAssetDocument[];

  const imageById = new Map<string, ImageAssetDocument>();
  const imageByUid = new Map<string, ImageAssetDocument>();

  for (const image of imageAssets) {
    imageById.set(image.id, image);
    if (image.uid) {
      imageByUid.set(image.uid, image);
    }
  }

  const manifest: ImageManifest = {
    generatedAt: new Date().toISOString(),
    widths: WIDTH_PRESET.slice(),
    collections: {}
  };

  let totalCollections = 0;
  let totalImages = 0;
  let totalVariants = 0;

  for (const collection of collections) {
    const collectionSlug = slugifySegment(collection.uid, collection.id);
    const usedSlugs = new Set<string>();
    const description = toPlainText(collection.data.short_description);
    const title = toPlainText(collection.data.title);
    const order = toNumeric(collection.data.order);
    const groupItems = Array.isArray(collection.data.images) ? collection.data.images : [];
    const images: ImageEntry[] = [];

    for (let index = 0; index < groupItems.length; index += 1) {
      const groupItem = groupItems[index];
      const relationship = groupItem?.asset;

      if (!relationship || (relationship.link_type && relationship.link_type !== "Document")) {
        continue;
      }

      if (relationship.type && relationship.type !== "image_asset") {
        continue;
      }

      let imageDoc: ImageAssetDocument | undefined;

      if (relationship.id && imageById.has(relationship.id)) {
        imageDoc = imageById.get(relationship.id);
      } else if (relationship.uid && imageByUid.has(relationship.uid)) {
        imageDoc = imageByUid.get(relationship.uid);
      }

      if (!imageDoc) {
        console.warn(`Nessun documento image_asset trovato per la relazione alla posizione ${index} della collezione ${collectionSlug}.`);
        continue;
      }

      const imageField = imageDoc.data.image;
      const imageUrl = imageField?.url ?? null;

      if (!imageUrl) {
        console.warn(`Documento image_asset ${imageDoc.id} privo di URL immagine, ignorato.`);
        continue;
      }

      const baseSlug = slugifySegment(imageDoc.uid, imageDoc.id);
      const imageSlug = ensureUniqueSlug(baseSlug, usedSlugs);

      const buffer = await fetchImageBuffer(imageUrl);
      const dimensions = imageField?.dimensions ?? {};
      const variants = await generateVariants({
        buffer,
        collectionSlug,
        imageSlug,
        originalWidth: dimensions?.width ?? null,
        originalHeight: dimensions?.height ?? null
      });

      if (variants.length === 0) {
        console.warn(`Impossibile generare varianti per l'immagine ${imageDoc.id}.`);
        continue;
      }

      const hash = crypto.createHash("sha256").update(buffer).digest("hex");
      const caption = toPlainText(imageDoc.data.caption);
      const credits = toPlainText(imageDoc.data.credits);
      const alt = toPlainText(imageField?.alt);
      const orderValue = toNumeric(imageDoc.data.order) ?? index;

      images.push({
        slug: imageSlug,
        documentId: imageDoc.id,
        documentUid: imageDoc.uid ?? null,
        order: orderValue,
        caption,
        credits,
        alt,
        hash,
        variants
      });

      totalImages += 1;
      totalVariants += variants.length;
    }

    images.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return a.slug.localeCompare(b.slug);
    });

    manifest.collections[collectionSlug] = {
      slug: collectionSlug,
      title,
      description,
      order,
      images
    };

    totalCollections += 1;
  }

  await writeManifest(manifest);

  console.log(
    `Generati ${totalVariants} file derivati per ${totalImages} immagini in ${totalCollections} collezioni.`
  );
  console.log(`Manifest salvato in ${path.relative(process.cwd(), MANIFEST_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
