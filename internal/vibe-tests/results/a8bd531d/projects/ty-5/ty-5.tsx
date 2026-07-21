import React from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[500px] p-12 text-center gap-6">
      <Heading level={1} type="display-1">Build faster with Astryx</Heading>
      <Text type="large" color="secondary">A modern design system for building beautiful, accessible React applications at scale.</Text>
      <div className="flex gap-3 flex-wrap justify-center">
        <Button label="Get started" variant="primary" size="lg" />
        <Button label="View docs" variant="secondary" size="lg" />
      </div>
    </section>
  );
}
