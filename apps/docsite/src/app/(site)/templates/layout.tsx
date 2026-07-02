// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Supplies metadata for the /templates gallery index. That page reads
 * `?preview=` via useSearchParams (so it's a client component and cannot export
 * metadata); this server layout provides it without touching that render path.
 */

import type {Metadata} from 'next';
import {pageMetadata} from '../../../lib/pageMetadata';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: 'Templates',
  description:
    'Ready-to-use page templates to kickstart your project: dashboards, settings, forms, AI chat, and more.',
  path: '/templates',
});

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
