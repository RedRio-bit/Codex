import type { Metadata } from 'next';
import './globals.css';
import RouteTransition from '@/components/RouteTransition';
import DynamicCursor from '@/components/DynamicCursor';

export const metadata: Metadata = {
  title: 'Codex — Archivio fotografico',
  description:
    'Archivio digitale di collezioni fotografiche: navigazione rapida, miniature e screensaver dinamico.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <DynamicCursor />
        <RouteTransition>
          <main>{children}</main>
        </RouteTransition>
      </body>
    </html>
  );
}
