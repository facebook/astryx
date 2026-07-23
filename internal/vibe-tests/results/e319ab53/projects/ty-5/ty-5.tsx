// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';

export default function LandingHero() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] p-12 gap-6">
      <Heading level={1}>Build faster with Astryx</Heading>
      <Text type="large">
        A composable design system that helps teams ship polished interfaces in hours, not weeks.
      </Text>
      <div className="flex gap-3">
        <Button label="Get Started" variant="primary" size="lg" />
        <Button label="Documentation" variant="secondary" size="lg" />
      </div>
    </div>
  );
}
