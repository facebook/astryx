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

  it('reflects elevation as a class and data attribute', () => {
    const {container} = render(<Card elevation="high">Content</Card>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('astryx-card');
    expect(root.className).toContain('high');
    expect(root.getAttribute('data-elevation')).toBe('high');
  });

  it('has no elevation data attribute when flat', () => {
    const {container} = render(<Card>Content</Card>);
    const root = container.firstElementChild!;
    expect(root.hasAttribute('data-elevation')).toBe(false);
  });

  it('drops the default variant border when elevated', () => {
    const flat = render(<Card>Content</Card>).container
      .firstElementChild as HTMLElement;
    const elevated = render(<Card elevation="low">Content</Card>).container
      .firstElementChild as HTMLElement;
    expect(getComputedStyle(flat).borderStyle).toBe('solid');
    expect(getComputedStyle(elevated).borderStyle).not.toBe('solid');
  });
});
