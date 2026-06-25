// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {StatusDot} from '@astryxdesign/core/StatusDot';

const styles = stylex.create({
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-body, #0a0a0a)',
    padding: 64,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  connector: {
    width: 80,
    height: 2,
    backgroundColor: 'var(--color-accent, #0066ff)',
    opacity: 0.5,
  },
  badgeRow: {
    display: 'flex',
    gap: 12,
  },
  subtitle: {
    maxWidth: 500,
    textAlign: 'center' as const,
  },
  availableRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
});

export default function ShowcaseHeaderPage() {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.content)}>
        <div {...stylex.props(styles.badgeRow)}>
          <Badge label="Open Source" variant="info" />
          <Badge label="Astryx" variant="success" />
        </div>

        <div {...stylex.props(styles.titleRow)}>
          <Heading level={1}>Astryx</Heading>
          <div {...stylex.props(styles.connector)} />
          <Heading level={1}>Astryx</Heading>
        </div>

        <div {...stylex.props(styles.subtitle)}>
          <Text type="large" color="secondary">
            A ground-up rebuild for modern React, AI tools, and beyond
          </Text>
        </div>

        <div {...stylex.props(styles.availableRow)}>
          <StatusDot variant="success" label="Available" isPulsing />
          <Text type="body" color="secondary">
            Available now
          </Text>
        </div>
      </div>
    </div>
  );
}
