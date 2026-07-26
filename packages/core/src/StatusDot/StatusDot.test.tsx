// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {Avatar} from '../Avatar/Avatar';
import {AvatarStatusDot} from '../Avatar/AvatarStatusDot';
import {StatusDot, type StatusDotVariant} from './StatusDot';

const GLYPH_SELECTOR = '.astryx-statusdot-glyph';

/** Renders a StatusDot and returns its root element. */
function renderDot(props: React.ComponentProps<typeof StatusDot>) {
  render(<StatusDot {...props} />);
  return screen.getByRole('img', {name: props.label});
}

describe('StatusDot', () => {
  it('renders with role="img" and aria-label', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot.tagName).toBe('SPAN');
  });

  it('renders with all variant types', () => {
    const variants = [
      'success',
      'warning',
      'error',
      'accent',
      'neutral',
    ] as const;

    for (const variant of variants) {
      const {unmount} = render(<StatusDot variant={variant} label={variant} />);
      expect(screen.getByRole('img', {name: variant})).toBeInTheDocument();
      unmount();
    }
  });

  it('renders at fixed 8px size', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLSpanElement | null};
    render(<StatusDot ref={ref} variant="success" label="Online" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('supports data-testid', () => {
    render(
      <StatusDot variant="success" label="Online" data-testid="status-dot" />,
    );
    expect(screen.getByTestId('status-dot')).toBeInTheDocument();
  });

  it('is not focusable', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot.getAttribute('tabindex')).toBeNull();
  });

  it('renders with isPulsing', () => {
    render(<StatusDot variant="success" label="Live" isPulsing />);
    const dot = screen.getByRole('img', {name: 'Live'});
    expect(dot).toBeInTheDocument();
  });

  it('renders without isPulsing by default', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  it('renders with tooltip', () => {
    render(<StatusDot variant="success" label="Online" tooltip="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  describe('shape glyphs (WCAG 1.4.1 — colour is not the only signal)', () => {
    it('renders no glyph for success: the plain filled dot is the reference shape', () => {
      const dot = renderDot({variant: 'success', label: 'Online'});
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });

    it('renders a distinct glyph shape per non-success variant', () => {
      const shapes = [
        ['neutral', 'ring'],
        ['error', 'minus'],
        ['warning', 'bang'],
        ['accent', 'plus'],
      ] as const;
      for (const [variant, shape] of shapes) {
        const dot = renderDot({variant, label: variant});
        const glyph = dot.querySelector(GLYPH_SELECTOR);
        expect(glyph, variant).not.toBeNull();
        expect(glyph, variant).toHaveAttribute('data-shape', shape);
      }
    });

    it('uses the same shape as AvatarStatusDot for the statuses both components share', () => {
      // The two components must speak one shape language: success filled,
      // neutral ring, error minus (see AvatarStatusDot, #4157).
      for (const variant of ['success', 'neutral', 'error'] as const) {
        const dot = renderDot({variant, label: variant});
        const {container} = render(
          <Avatar
            name="Ada Lovelace"
            size={48}
            status={<AvatarStatusDot variant={variant} />}
          />,
        );
        const avatarGlyph = container.querySelector(
          '.astryx-avatar-status-dot-glyph',
        );
        const statusGlyph = dot.querySelector(GLYPH_SELECTOR);
        expect(statusGlyph?.getAttribute('data-shape') ?? null, variant).toBe(
          avatarGlyph?.getAttribute('data-shape') ?? null,
        );
      }
    });

    it('hides the glyph from assistive tech: it is a visual redundancy of the status', () => {
      const dot = renderDot({variant: 'error', label: 'Offline'});
      expect(dot.querySelector(GLYPH_SELECTOR)).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    it('draws the glyph as a stroked inline svg sized to the 8px dot', () => {
      // Same zero-dependency approach as AvatarStatusDot: a stroked <svg>
      // whose viewBox is 1 user unit per px of the dot.
      const dot = renderDot({variant: 'neutral', label: 'Away'});
      const glyph = dot.querySelector(GLYPH_SELECTOR) as SVGElement;
      expect(glyph.tagName.toLowerCase()).toBe('svg');
      expect(glyph.getAttribute('viewBox')).toBe('0 0 8 8');
      expect(glyph.getAttribute('width')).toBe('8');
      expect(glyph.getAttribute('height')).toBe('8');
    });

    it('paints every glyph from currentColor so the dot owns the ink colour', () => {
      const variants = ['neutral', 'error', 'warning', 'accent'] as const;
      for (const variant of variants) {
        const dot = renderDot({variant, label: variant});
        const marks = dot.querySelectorAll(
          `${GLYPH_SELECTOR} circle, ${GLYPH_SELECTOR} line`,
        );
        expect(marks.length, variant).toBeGreaterThan(0);
        for (const mark of marks) {
          expect(mark.getAttribute('stroke'), variant).toBe('currentColor');
          expect(mark.getAttribute('stroke-width'), variant).toBe('1');
        }
      }
    });

    it('strokes the ring to land exactly on the 8px field', () => {
      const dot = renderDot({variant: 'neutral', label: 'Away'});
      const circle = dot.querySelector(
        `${GLYPH_SELECTOR} circle`,
      ) as SVGCircleElement;
      expect(circle).not.toBeNull();
      // Radius is to the stroke centreline: (8 - 1) / 2.
      expect(circle.getAttribute('r')).toBe('3.5');
      expect(circle.getAttribute('cx')).toBe('4');
      expect(circle.getAttribute('cy')).toBe('4');
      expect(circle.getAttribute('fill')).toBe('none');
    });

    it('draws minus horizontal and bang vertical with round caps: orientation separates them', () => {
      const minus = renderDot({variant: 'error', label: 'Busy'}).querySelector(
        `${GLYPH_SELECTOR} line`,
      ) as SVGLineElement;
      expect(minus.getAttribute('y1')).toBe(minus.getAttribute('y2'));
      expect(minus.getAttribute('stroke-linecap')).toBe('round');

      const bang = renderDot({
        variant: 'warning',
        label: 'Degraded',
      }).querySelector(`${GLYPH_SELECTOR} line`) as SVGLineElement;
      expect(bang.getAttribute('x1')).toBe(bang.getAttribute('x2'));
      expect(bang.getAttribute('stroke-linecap')).toBe('round');
    });

    it('crosses two bars for plus', () => {
      const dot = renderDot({variant: 'accent', label: 'Featured'});
      const lines = dot.querySelectorAll(`${GLYPH_SELECTOR} line`);
      expect(lines.length).toBe(2);
    });

    it('fills the ring variant with surface and inks it with the variant colour', () => {
      // A ring only reads as hollow if its interior is not the variant
      // colour, so `neutral` inverts — same as AvatarStatusDot.
      const probe = stylex.create({
        ring: {
          backgroundColor: colorVars['--color-background-surface'],
          color: colorVars['--color-icon-secondary'],
        },
      });
      const dot = renderDot({variant: 'neutral', label: 'Away'});
      const atomicClasses = (stylex.props(probe.ring).className ?? '')
        .split(' ')
        // Dev mode prepends a per-file `File__style.key` debug class that
        // legitimately differs between the probe and the component.
        .filter(cls => !cls.includes('__'));
      expect(atomicClasses.length).toBeGreaterThan(0);
      for (const cls of atomicClasses) {
        expect(dot.className).toContain(cls);
      }
    });

    it('renders no glyph for custom augmented variants (documented: they must bring their own non-colour mark)', () => {
      const dot = renderDot({
        variant: 'critical' as StatusDotVariant,
        label: 'Critical',
      });
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });
  });

  describe('accessible name (label reaches AT without hover)', () => {
    it('exposes the status label as the accessible name for every variant, without a tooltip', () => {
      const variants = [
        'success',
        'warning',
        'error',
        'accent',
        'neutral',
      ] as const;
      for (const variant of variants) {
        const {unmount} = render(
          <StatusDot variant={variant} label={`Status: ${variant}`} />,
        );
        const dot = screen.getByRole('img', {name: `Status: ${variant}`});
        expect(dot).toHaveAttribute('aria-label', `Status: ${variant}`);
        // The name must not depend on hover or focus.
        expect(dot.getAttribute('tabindex')).toBeNull();
        unmount();
      }
    });

    it('keeps the accessible name on the dot itself when a glyph renders', () => {
      const dot = renderDot({variant: 'error', label: 'Do not disturb'});
      expect(dot).toHaveAttribute('role', 'img');
      expect(dot).toHaveAttribute('aria-label', 'Do not disturb');
    });
  });
});
