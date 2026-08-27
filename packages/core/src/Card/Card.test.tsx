// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRef} from 'react';
import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {Card} from './Card';
import type {CardVariant} from './Card';

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

  // Deriving the prop from CardVariantMap must not change which values it
  // accepts. A key added to or dropped from the map fails to type-check here:
  // a missing one against Record<CardVariant, true>, an extra one as an excess
  // property.
  const builtInVariants: Record<CardVariant, true> = {
    default: true,
    transparent: true,
    muted: true,
    blue: true,
    cyan: true,
    gray: true,
    green: true,
    orange: true,
    pink: true,
    purple: true,
    red: true,
    teal: true,
    yellow: true,
  };

  it('accepts exactly the thirteen built-in variants, each reflected', () => {
    const variants = Object.keys(builtInVariants) as CardVariant[];
    expect(variants).toHaveLength(13);
    for (const variant of variants) {
      const {container} = render(<Card variant={variant}>C</Card>);
      expect(container.firstElementChild).toHaveAttribute(
        'data-variant',
        variant,
      );
    }
  });

  describe('a variant a theme added', () => {
    // The cast stands in for the module augmentation `astryx theme build`
    // emits; that the augmentation itself widens the prop is covered by
    // packages/cli/clients/cli/commands/build-theme.variants.test.mjs.
    const themeAdded = 'brand' as CardVariant;

    const classesFor = (variant: CardVariant) => {
      const {container} = render(<Card variant={variant}>C</Card>);
      return new Set(container.firstElementChild!.className.split(' '));
    };

    it('renders the selector a theme rule needs', () => {
      const {container} = render(<Card variant={themeAdded}>C</Card>);
      const root = container.firstElementChild!;
      expect(root).toHaveAttribute('data-variant', 'brand');
      expect(root.className).toContain('astryx-card');
      expect(root.className).toContain('brand');
    });

    it('falls through to base styles instead of another variant', () => {
      const muted = classesFor('muted');
      const blue = classesFor('blue');
      const brand = classesFor(themeAdded);

      const variantOwned = [
        ...[...muted].filter(c => !blue.has(c)),
        ...[...blue].filter(c => !muted.has(c)),
      ];
      const shared = [...muted].filter(c => blue.has(c));

      expect(variantOwned.length).toBeGreaterThan(0);
      expect(variantOwned.filter(c => brand.has(c))).toEqual([]);
      expect(shared.filter(c => !brand.has(c))).toEqual([]);
    });
  });
});
