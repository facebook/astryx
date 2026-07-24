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

  it('applies a distinct class for each elevation level', () => {
    const classFor = (elevation: 'none' | 'low' | 'med' | 'high') => {
      const {container} = render(<Card elevation={elevation}>C</Card>);
      return container.firstElementChild!.className;
    };
    const none = classFor('none');
    const low = classFor('low');
    const med = classFor('med');
    const high = classFor('high');
    expect(new Set([none, low, med, high]).size).toBe(4);
  });

  it('defaults to flat (elevation none) — same class as explicit none', () => {
    const {container: defaultContainer} = render(<Card>C</Card>);
    const {container: noneContainer} = render(<Card elevation="none">C</Card>);
    expect(defaultContainer.firstElementChild!.className).toBe(
      noneContainer.firstElementChild!.className,
    );
  });
});
