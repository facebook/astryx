// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Metadata} from 'next';
import {PlaygroundClient} from './PlaygroundClient';

export const metadata: Metadata = {
  title: 'XDS Playground',
  description: 'Interactive code playground for XDS components',
};

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}
