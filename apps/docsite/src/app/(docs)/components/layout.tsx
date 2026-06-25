// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Supplies metadata for the /components gallery index. That page is a client
 * component ('use client'), which cannot export metadata, so this server layout
 * provides it. The dynamic /components/[name] pages set their own per-component
 * metadata via generateMetadata, which overrides the defaults declared here.
 */

import type {Metadata} from 'next';
import {pageMetadata} from '../../../lib/pageMetadata';

export const metadata: Metadata = pageMetadata({
  title: 'Components',
  description:
    'Browse every Astryx component with copy-ready examples for each variant, state, and pattern.',
  path: '/components',
});

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
