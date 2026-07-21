import React from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500, padding: 48, textAlign: 'center', gap: 24 },
  buttons: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
});

export default function HeroSection() {
  return (
    <section {...stylex.props(styles.hero)}>
      <Heading level={1} type="display-1">Build faster with Astryx</Heading>
      <Text type="large" color="secondary">A modern design system for building beautiful, accessible React applications at scale.</Text>
      <div {...stylex.props(styles.buttons)}>
        <Button label="Get started" variant="primary" size="lg" />
        <Button label="View docs" variant="secondary" size="lg" />
      </div>
    </section>
  );
}
