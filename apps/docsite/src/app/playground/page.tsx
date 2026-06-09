// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import {Suspense} from 'react';
import {PlaygroundClient} from './PlaygroundClient';

export const metadata: Metadata = {
  title: 'Astryx Playground',
  description: 'Interactive code playground for Astryx components',
};

export default function PlaygroundPage() {
  return (
    <Suspense fallback={null}>
      <PlaygroundClient />
    </Suspense>
  );
}
