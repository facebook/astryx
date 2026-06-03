// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import {PlaygroundClient} from './PlaygroundClient';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Interactive code playground for Astryx components',
};

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}
