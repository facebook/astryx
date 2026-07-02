// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {Card} from './Card';

describe('Card', () => {
  it('renders children', () => {
    const {getByText} = render(<Card>Hello</Card>);
    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('renders astryx-* class names for theme targeting', () => {
    const {container} = render(<Card>Content</Card>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('astryx-card');
  });

  it('renders transparent variant with variant class', () => {
    const {container} = render(<Card variant="transparent">Content</Card>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('astryx-card');
    expect(root.className).toContain('transparent');
  });

  // The `default` variant's border is a fake border drawn with an inset
  // box-shadow (styles.withBorder), not a real CSS border. Other variants draw
  // no border at all. This keeps identical geometry across variants (no layout
  // jitter) and lets interactive compositions tint the whole card — border
  // included — with a single `::after` overlay.
  it('applies the box-shadow border style on the default variant', () => {
    const {container} = render(<Card variant="default">Content</Card>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('Card__styles.withBorder');
  });

  it('does NOT apply the border style on non-default variants', () => {
    for (const variant of ['transparent', 'muted', 'blue'] as const) {
      const {container} = render(<Card variant={variant}>Content</Card>);
      const root = container.firstElementChild!;
      expect(root.className).not.toContain('Card__styles.withBorder');
    }
  });
});
