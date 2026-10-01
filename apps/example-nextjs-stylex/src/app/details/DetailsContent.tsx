// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import Link from 'next/link';
import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';

const styles = stylex.create({
  main: {
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: 'var(--color-background-body)',
  },
  content: {
    maxWidth: 640,
    marginInline: 'auto',
  },
  link: {
    color: 'var(--color-text-accent)',
  },
});

export function DetailsContent() {
  return (
    <main data-product-stylex="details" {...stylex.props(styles.main)}>
      <VStack gap={4} xstyle={styles.content}>
        <Heading level={1}>Server route with client StyleX</Heading>
        <Text>
          This server route composes a client StyleX module while Astryx
          continues to use its precompiled CSS.
        </Text>
        <Link href="/" {...stylex.props(styles.link)}>
          Back to the main example
        </Link>
      </VStack>
    </main>
  );
}
