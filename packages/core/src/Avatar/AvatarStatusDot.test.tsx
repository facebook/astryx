// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {Avatar} from './Avatar';
import {AvatarStatusDot, type AvatarStatusDotVariant} from './AvatarStatusDot';

const GLYPH_SELECTOR = '.astryx-avatar-status-dot-glyph';
const DOT_SELECTOR = '.astryx-avatar-status-dot';

/**
 * Renders an AvatarStatusDot inside an Avatar of the given numeric size and
 * returns the dot root element. Size tiers: <=36 -> 10px dot (no icons),
 * 40-72 -> 20px dot, >=96 -> 32px dot.
 */
function renderDot(
  dotProps: React.ComponentProps<typeof AvatarStatusDot>,
  avatarSize: 36 | 48 | 128 = 48,
) {
  const {container} = render(
    <Avatar
      name="Ada Lovelace"
      size={avatarSize}
      status={<AvatarStatusDot {...dotProps} />}
    />,
  );
  const dot = container.querySelector(DOT_SELECTOR);
  expect(dot).not.toBeNull();
  return dot as HTMLElement;
}

describe('AvatarStatusDot', () => {
  describe('shape glyphs (WCAG 1.4.1 — colour is not the only signal)', () => {
    it('renders no glyph for success: the plain filled dot is the reference shape', () => {
      const dot = renderDot({variant: 'success'});
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });

    it('renders a ring glyph for neutral', () => {
      const dot = renderDot({variant: 'neutral'});
      const glyph = dot.querySelector(GLYPH_SELECTOR);
      expect(glyph).not.toBeNull();
      expect(glyph).toHaveAttribute('data-shape', 'ring');
    });

    it('renders a minus glyph for error', () => {
      const dot = renderDot({variant: 'error'});
      const glyph = dot.querySelector(GLYPH_SELECTOR);
      expect(glyph).not.toBeNull();
      expect(glyph).toHaveAttribute('data-shape', 'minus');
    });

    it('hides the glyph from assistive tech: it is a visual redundancy of the status', () => {
      const dot = renderDot({variant: 'error'});
      expect(dot.querySelector(GLYPH_SELECTOR)).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    it('renders glyphs at every size tier', () => {
      for (const size of [36, 48, 128] as const) {
        const dot = renderDot({variant: 'neutral'}, size);
        expect(dot.querySelector(GLYPH_SELECTOR)).not.toBeNull();
      }
    });

    it('pins the exact glyph geometry per shape and tier', () => {
      // StyleX atomic classes are deterministic: the same property/value
      // compiles to the same class, so a local probe style pins the
      // component's geometry in absolute pixels (ring hole 50% of the
      // inner field, minus bar 75% x 25% — whole pixels per tier).
      const expectedGeometry = stylex.create({
        ringSmall: {width: 4, height: 4},
        ringMedium: {width: 8, height: 8},
        ringLarge: {width: 12, height: 12},
        minusSmall: {width: 6, height: 2},
        minusMedium: {width: 12, height: 4},
        minusLarge: {width: 18, height: 6},
      });
      const cases = [
        ['neutral', 36, expectedGeometry.ringSmall],
        ['neutral', 48, expectedGeometry.ringMedium],
        ['neutral', 128, expectedGeometry.ringLarge],
        ['error', 36, expectedGeometry.minusSmall],
        ['error', 48, expectedGeometry.minusMedium],
        ['error', 128, expectedGeometry.minusLarge],
      ] as const;
      for (const [variant, size, probe] of cases) {
        const glyph = renderDot({variant}, size).querySelector(
          GLYPH_SELECTOR,
        ) as HTMLElement;
        // Compare atomic classes only — dev mode prepends a per-file debug
        // class (`File__style.key`) that legitimately differs between the
        // probe and the component.
        const atomicClasses = (stylex.props(probe).className ?? '')
          .split(' ')
          .filter(cls => !cls.includes('__'));
        expect(atomicClasses.length).toBeGreaterThan(0);
        for (const cls of atomicClasses) {
          expect(
            glyph.className,
            `${variant} at avatar size ${size}`,
          ).toContain(cls);
        }
      }
    });

    it('renders no glyph for custom augmented variants (documented: they must bring their own non-colour mark)', () => {
      const dot = renderDot({variant: 'away' as AvatarStatusDotVariant});
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });
  });

  describe('glyph and icon interplay', () => {
    it('suppresses the glyph when a user icon renders: the icon is the non-colour mark', () => {
      const dot = renderDot(
        {variant: 'error', icon: <svg data-testid="user-icon" />},
        48,
      );
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });

    it('keeps the glyph at the smallest tier where icons never render', () => {
      const dot = renderDot(
        {variant: 'error', icon: <svg data-testid="user-icon" />},
        36,
      );
      expect(screen.queryByTestId('user-icon')).not.toBeInTheDocument();
      expect(dot.querySelector(GLYPH_SELECTOR)).not.toBeNull();
    });

    it('keeps the glyph for non-renderable icons: booleans from `cond && <Icon />` render nothing', () => {
      for (const nonRenderable of [true, false, ''] as const) {
        const dot = renderDot({variant: 'error', icon: nonRenderable}, 48);
        expect(
          dot.querySelector(GLYPH_SELECTOR),
          `icon={${JSON.stringify(nonRenderable)}}`,
        ).not.toBeNull();
      }
    });
  });

  describe('existing contract', () => {
    it('exposes role="img" with the label as accessible name when label is provided', () => {
      const dot = renderDot({variant: 'success', label: 'Online'});
      expect(dot).toHaveAttribute('role', 'img');
      expect(dot).toHaveAttribute('aria-label', 'Online');
    });

    it('has no img role without a label', () => {
      const dot = renderDot({variant: 'success'});
      expect(dot).not.toHaveAttribute('role');
    });

    it('reflects the variant as a data attribute for theming', () => {
      const dot = renderDot({variant: 'neutral'});
      expect(dot).toHaveAttribute('data-variant', 'neutral');
    });

    it('renders the user icon at tiers with room for it, hidden from assistive tech', () => {
      renderDot(
        {variant: 'success', icon: <svg data-testid="user-icon" />},
        128,
      );
      const icon = screen.getByTestId('user-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
