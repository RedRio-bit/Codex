import Link from 'next/link';
import styles from './page.module.css';
import { getCollectionsIndex } from '@/lib/prismic';

export const revalidate = 120;

export default async function IndexPage() {
  const collections = await getCollectionsIndex();
  const totalShots = collections.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className={styles.container}>
      <header>
        <h1 className={styles.title}>Archivio fotografico</h1>
        <p className={styles.intro}>
          Elenco delle serie ordinate direttamente da Prismic. {collections.length} collezioni,{' '}
          {totalShots} scatti complessivi.
        </p>
      </header>

      <ol className={styles.list}>
        {collections.map((collection) => (
          <li key={collection.slug} className={styles.item}>
            <Link
              href={`/${collection.slug}`}
              className={styles.itemLink}
              data-cursor-label={`Apri ${collection.slug}`}
            >
              <span>{collection.slug}</span>
              {collection.title}
            </Link>
            <div className={styles.meta}>
              <span className={styles.count}>{formatShots(collection.count)}</span>
              {collection.summary && <span className={styles.summary}>{collection.summary}</span>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatShots(value: number) {
  if (value === 1) return '1 scatto';
  return `${value} scatti`;
}
