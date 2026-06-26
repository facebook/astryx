// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Supplies metadata for the /components gallery index. That page is a client
 * component ('use client'), which cannot export metadata, so this server layout
 * provides it. The dynamic /components/[name] pages set their own per-component
 * metadata via generateMetadata, which overrides the defaults declared here.
 */

import type {Metadata} from 'next';
import {pageMetadata} from '../../../lib/pageMetadata';
import {SITE_NAME} from '../../../lib/siteConfig';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Components',
    description:
      'Browse every Astryx component with copy-ready examples for each variant, state, and pattern.',
    path: '/components',
  }),
  // Brand the per-component page titles (e.g. "Button · Astryx") so browser
  // tabs are distinguishable. A plain string title at this layout segment was
  // shadowing the root title template for the dynamic /components/[name] pages,
  // so re-declare the template here; `default` titles the gallery index.
  title: {
    default: 'Components',
    template: `%s · ${SITE_NAME}`,
  },
};

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
