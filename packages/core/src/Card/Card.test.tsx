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
    const {container} = render(
      <Card variant="transparent">Content</Card>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('astryx-card');
    expect(root.className).toContain('transparent');
  });
});
