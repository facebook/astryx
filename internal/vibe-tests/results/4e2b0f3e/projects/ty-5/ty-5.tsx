// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center gap-6 py-20 px-4 text-center">
      <Heading level={1} type="display-1" justify="center">
        Build faster with Astryx
      </Heading>
      <Text type="large" color="secondary" justify="center">
        A modern design system that helps you ship beautiful, accessible interfaces in record time.
      </Text>
      <div className="flex gap-3">
        <Button label="Get Started" variant="primary" size="lg" />
        <Button label="View Docs" variant="secondary" size="lg" />
      </div>
    </div>
  );
}
