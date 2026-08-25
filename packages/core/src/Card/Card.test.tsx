// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRef} from 'react';
import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {Card} from './Card';

describe('Card', () => {
  it('renders children', () => {
    const {getByText} = render(<Card>Hello</Card>);
    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('forwards ref to the rendered element', () => {
    const ref = createRef<HTMLDivElement>();
    const {container} = render(<Card ref={ref}>C</Card>);
    expect(ref.current).toBe(container.firstElementChild);
  });

  it('spreads unknown props onto the same element that carries the theme target', () => {
    const {getByTestId} = render(
      <Card data-testid="card" id="promo" aria-label="Promotion">
        C
      </Card>,
    );
    const root = getByTestId('card');
    expect(root).toHaveAttribute('id', 'promo');
    expect(root).toHaveAttribute('aria-label', 'Promotion');
    expect(root.className).toContain('astryx-card');
  });

  it('merges a consumer className instead of replacing the theme target', () => {
    const {container} = render(<Card className="promo">C</Card>);
    const root = container.firstElementChild!;
    expect(root.className).toContain('astryx-card');
    expect(root.className).toContain('promo');
  });

  it('reflects variant as a theme data attribute', () => {
    const {container} = render(<Card variant="muted">C</Card>);
    expect(container.firstElementChild).toHaveAttribute(
      'data-variant',
      'muted',
    );
  });

  it('reflects elevation as a theme data attribute', () => {
    const {container} = render(<Card elevation="high">C</Card>);
    expect(container.firstElementChild).toHaveAttribute(
      'data-elevation',
      'high',
    );
  });

  it('defaults to the default variant at rest elevation', () => {
    const {container} = render(<Card>C</Card>);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('data-variant', 'default');
    expect(root).toHaveAttribute('data-elevation', 'none');
  });

  it('applies a distinct class for each elevation level', () => {
    const classFor = (elevation: 'none' | 'low' | 'med' | 'high') => {
      const {container} = render(<Card elevation={elevation}>C</Card>);
      return container.firstElementChild!.className;
    };
    const classes = (['none', 'low', 'med', 'high'] as const).map(classFor);
    expect(new Set(classes).size).toBe(4);
  });
});
