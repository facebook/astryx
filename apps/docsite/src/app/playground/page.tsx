// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import {Suspense} from 'react';
import {headers} from 'next/headers';
import {PlaygroundClient} from './PlaygroundClient';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Astryx Playground',
  description: 'Interactive code playground for Astryx components',
};

export default async function PlaygroundPage() {
  const headersList = await headers();
  const ua = headersList.get('user-agent') ?? '';
  const defaultIsMobile = /mobile|android|iphone|ipad/i.test(ua);

  return (
    <Suspense fallback={null}>
      <PlaygroundClient defaultIsMobile={defaultIsMobile} />
    </Suspense>
  );
}
