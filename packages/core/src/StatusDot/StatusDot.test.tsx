// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {registerIcons, resetIcons} from '../Icon';
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
    it('renders no glyph for accent: the plain filled dot is the reference shape', () => {
      const dot = renderDot({variant: 'accent', label: 'Featured'});
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });

    it('renders a distinct glyph shape per non-accent variant', () => {
      const shapes = [
        ['success', 'check'],
        ['warning', 'exclamation'],
        ['error', 'cross'],
        ['neutral', 'ring'],
      ] as const;
      for (const [variant, shape] of shapes) {
        const dot = renderDot({variant, label: variant});
        const glyph = dot.querySelector(GLYPH_SELECTOR);
        expect(glyph, variant).not.toBeNull();
        expect(glyph, variant).toHaveAttribute('data-shape', shape);
      }
    });

    it('maps success/warning/error to the semantic icon vocabulary, not Avatar presence shapes', () => {
      // StatusDot speaks the defaultIcons language — check, exclamation, cross
      // — the same marks Banner and FieldStatus render. This is deliberately a
      // different axis of consistency from AvatarStatusDot (online/away/busy);
      // the two share only the neutral ring (#4373). There is intentionally no
      // cross-component parity assertion here.
      const semantic = [
        ['success', 'check'],
        ['warning', 'exclamation'],
        ['error', 'cross'],
      ] as const;
      for (const [variant, shape] of semantic) {
        const dot = renderDot({variant, label: variant});
        expect(
          dot.querySelector(GLYPH_SELECTOR)?.getAttribute('data-shape'),
          variant,
        ).toBe(shape);
      }
    });

    it('hides the glyph from assistive tech: it is a visual redundancy of the status', () => {
      const dot = renderDot({variant: 'error', label: 'Offline'});
      expect(dot.querySelector(GLYPH_SELECTOR)).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    });

    it('draws the glyph as an inline svg sized to the 8px dot', () => {
      // A zero-dependency stroked <svg> whose viewBox is 1 user unit per px of
      // the dot, so glyph geometry is literal px.
      const dot = renderDot({variant: 'neutral', label: 'Away'});
      const glyph = dot.querySelector(GLYPH_SELECTOR) as SVGElement;
      expect(glyph.tagName.toLowerCase()).toBe('svg');
      expect(glyph.getAttribute('viewBox')).toBe('0 0 8 8');
      expect(glyph.getAttribute('width')).toBe('8');
      expect(glyph.getAttribute('height')).toBe('8');
    });

    it('paints every glyph mark from currentColor so the dot owns the ink colour', () => {
      const variants = ['success', 'warning', 'error', 'neutral'] as const;
      for (const variant of variants) {
        const dot = renderDot({variant, label: variant});
        const marks = dot.querySelectorAll(
          `${GLYPH_SELECTOR} circle, ${GLYPH_SELECTOR} line, ${GLYPH_SELECTOR} path`,
        );
        expect(marks.length, variant).toBeGreaterThan(0);
        for (const mark of marks) {
          // The stroked marks ink via `stroke`; the exclamation's filled dot
          // inks via `fill`. Either way the paint comes from `currentColor`.
          const paint =
            mark.getAttribute('stroke') === 'currentColor' ||
            mark.getAttribute('fill') === 'currentColor';
          expect(paint, variant).toBe(true);
        }
      }
    });

    it('thickens the diagonal check and cross so they stay crisp and distinct at 8px', () => {
      // check vs cross is the pair a colour-blind user leans on; a 1px
      // diagonal blurs at 8px, so both take the heavier 1.25px stroke.
      for (const variant of ['success', 'error'] as const) {
        const dot = renderDot({variant, label: variant});
        const marks = dot.querySelectorAll(
          `${GLYPH_SELECTOR} path, ${GLYPH_SELECTOR} line`,
        );
        expect(marks.length, variant).toBeGreaterThan(0);
        for (const mark of marks) {
          expect(mark.getAttribute('stroke-width'), variant).toBe('1.25');
        }
      }
    });

    it('keeps the ring and the exclamation stem at the 1px baseline', () => {
      const ring = renderDot({variant: 'neutral', label: 'Away'}).querySelector(
        `${GLYPH_SELECTOR} circle`,
      ) as SVGCircleElement;
      expect(ring.getAttribute('stroke-width')).toBe('1');

      const stem = renderDot({
        variant: 'warning',
        label: 'Degraded',
      }).querySelector(`${GLYPH_SELECTOR} line`) as SVGLineElement;
      expect(stem.getAttribute('stroke-width')).toBe('1');
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

    it('draws the success check as one connected, round-joined polyline', () => {
      const dot = renderDot({variant: 'success', label: 'Online'});
      const path = dot.querySelector(
        `${GLYPH_SELECTOR} path`,
      ) as SVGPathElement;
      expect(path).not.toBeNull();
      expect(path.getAttribute('stroke-linecap')).toBe('round');
      expect(path.getAttribute('stroke-linejoin')).toBe('round');
      // A single polyline — no separate line/circle marks.
      expect(
        dot.querySelectorAll(`${GLYPH_SELECTOR} line, ${GLYPH_SELECTOR} circle`)
          .length,
      ).toBe(0);
    });

    it('crosses two round-capped diagonals for the error cross', () => {
      const dot = renderDot({variant: 'error', label: 'Offline'});
      const lines = dot.querySelectorAll(`${GLYPH_SELECTOR} line`);
      expect(lines.length).toBe(2);
      for (const line of lines) {
        expect(line.getAttribute('stroke-linecap')).toBe('round');
        // A diagonal moves in both axes — not a horizontal or vertical bar.
        expect(line.getAttribute('x1')).not.toBe(line.getAttribute('x2'));
        expect(line.getAttribute('y1')).not.toBe(line.getAttribute('y2'));
      }
    });

    it('draws the warning exclamation as a vertical stem over a filled dot', () => {
      const dot = renderDot({variant: 'warning', label: 'Degraded'});
      const stem = dot.querySelector(
        `${GLYPH_SELECTOR} line`,
      ) as SVGLineElement;
      // Vertical stem: x constant, y varies, round cap.
      expect(stem.getAttribute('x1')).toBe(stem.getAttribute('x2'));
      expect(stem.getAttribute('y1')).not.toBe(stem.getAttribute('y2'));
      expect(stem.getAttribute('stroke-linecap')).toBe('round');
      // A filled dot sits below the stem.
      const dotMark = dot.querySelector(
        `${GLYPH_SELECTOR} circle`,
      ) as SVGCircleElement;
      expect(dotMark.getAttribute('fill')).toBe('currentColor');
      expect(Number(dotMark.getAttribute('cy'))).toBeGreaterThan(
        Number(stem.getAttribute('y2')),
      );
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

  describe('custom icon (parity with AvatarStatusDot)', () => {
    const ICON_TESTID = 'custom-icon';
    function Icon() {
      return <svg data-testid={ICON_TESTID} />;
    }

    it('renders a provided icon inside the dot', () => {
      renderDot({variant: 'success', label: 'Verified', icon: <Icon />});
      expect(screen.getByTestId(ICON_TESTID)).toBeInTheDocument();
    });

    it('suppresses the built-in glyph when an icon renders', () => {
      const dot = renderDot({
        variant: 'error',
        label: 'Offline',
        icon: <Icon />,
      });
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });

    it('hides the icon wrapper from assistive tech (the label carries the status)', () => {
      renderDot({variant: 'success', label: 'Verified', icon: <Icon />});
      const iconEl = screen.getByTestId(ICON_TESTID);
      expect(iconEl.closest('[aria-hidden="true"]')).not.toBeNull();
    });

    it.each([false, true, null, undefined, ''])(
      'ignores %s and keeps the built-in glyph (safe for `cond && <Icon />`)',
      value => {
        const dot = renderDot({
          variant: 'error',
          label: 'Offline',
          icon: value,
        });
        const glyph = dot.querySelector(GLYPH_SELECTOR);
        expect(glyph).not.toBeNull();
        expect(glyph).toHaveAttribute('data-shape', 'cross');
      },
    );

    it('treats a component that renders nothing as an icon and suppresses the glyph', () => {
      function Empty() {
        return null;
      }
      const dot = renderDot({
        variant: 'error',
        label: 'Offline',
        icon: <Empty />,
      });
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });

    it('keeps the accessible name on the dot when an icon renders', () => {
      const dot = renderDot({
        variant: 'success',
        label: 'Verified',
        icon: <Icon />,
      });
      expect(dot).toHaveAttribute('role', 'img');
      expect(dot).toHaveAttribute('aria-label', 'Verified');
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

  describe('icon registry integration (statusdot:<variant> keys)', () => {
    afterEach(() => {
      resetIcons();
    });

    it('renders a registered statusdot:<variant> icon instead of the built-in glyph', () => {
      registerIcons({
        'statusdot:success': (
          <svg data-testid="custom-success-glyph">
            <circle />
          </svg>
        ),
      });
      const dot = renderDot({variant: 'success', label: 'Online'});
      expect(screen.getByTestId('custom-success-glyph')).toBeInTheDocument();
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });

    it('scopes an override to its own variant — others keep the built-in glyph', () => {
      registerIcons({
        'statusdot:success': <svg data-testid="custom-success-glyph" />,
      });
      const dot = renderDot({variant: 'error', label: 'Offline'});
      expect(
        screen.queryByTestId('custom-success-glyph'),
      ).not.toBeInTheDocument();
      expect(dot.querySelector(GLYPH_SELECTOR)).toHaveAttribute(
        'data-shape',
        'cross',
      );
    });

    it('does not inherit overrides of the standard 24px semantic icons', () => {
      // Redrawing the full-size `check`/`success` icons must not silently
      // restyle the 8px dot — the dot only listens to its scoped keys.
      registerIcons({
        check: <svg data-testid="big-check" />,
        success: <svg data-testid="big-success" />,
      });
      const dot = renderDot({variant: 'success', label: 'Online'});
      expect(screen.queryByTestId('big-check')).not.toBeInTheDocument();
      expect(screen.queryByTestId('big-success')).not.toBeInTheDocument();
      expect(dot.querySelector(GLYPH_SELECTOR)).toHaveAttribute(
        'data-shape',
        'check',
      );
    });

    it('lets the explicit icon prop win over a registry override', () => {
      registerIcons({
        'statusdot:success': <svg data-testid="registry-glyph" />,
      });
      renderDot({
        variant: 'success',
        label: 'Online',
        icon: <svg data-testid="prop-icon" />,
      });
      expect(screen.getByTestId('prop-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('registry-glyph')).not.toBeInTheDocument();
    });

    it('gives augmented custom variants a themeable mark via their scoped key', () => {
      registerIcons({
        'statusdot:critical': <svg data-testid="critical-glyph" />,
      });
      const dot = renderDot({
        variant: 'critical' as StatusDotVariant,
        label: 'Critical',
      });
      expect(screen.getByTestId('critical-glyph')).toBeInTheDocument();
      expect(dot.querySelector(GLYPH_SELECTOR)).toBeNull();
    });
  });
});
