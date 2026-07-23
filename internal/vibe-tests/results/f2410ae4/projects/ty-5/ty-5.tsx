// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '60vh',
    padding: 48,
  },
});

export default function LandingHero() {
  return (
    <div {...stylex.props(styles.hero)}>
      <VStack gap={4}>
        <Heading level={1}>Build faster with Astryx</Heading>
        <Text type="large">
          A composable design system that helps teams ship polished interfaces in hours, not weeks.
        </Text>
        <HStack gap={2}>
          <Button label="Get Started" variant="primary" size="lg" />
          <Button label="Documentation" variant="secondary" size="lg" />
        </HStack>
      </VStack>
    </div>
  );
}
