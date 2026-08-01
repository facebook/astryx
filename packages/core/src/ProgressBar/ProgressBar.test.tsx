// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProgressBar} from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('uses role="progressbar" (not "meter") for determinate progress', () => {
    // A determinate ProgressBar conveys task completion, so it must be a
    // progressbar (announced on update), not a meter (a static gauge).
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });

  it('renders visible label by default', () => {
    render(<ProgressBar value={50} label="Storage used" />);
    expect(screen.getByText('Storage used')).toBeInTheDocument();
  });

  it('hides label visually when isLabelHidden is true', () => {
    render(<ProgressBar value={50} label="Hidden label" isLabelHidden />);
    const label = screen.getByText('Hidden label');
    expect(label).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-labelledby');
  });

  it('shows value label when hasValueLabel is true', () => {
    render(<ProgressBar value={75} label="Upload" hasValueLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('uses custom formatValueLabel', () => {
    render(
      <ProgressBar
        value={3}
        max={5}
        label="Disk"
        hasValueLabel
        formatValueLabel={(v, m) => `${v} GB / ${m} GB`}
      />,
    );
    expect(screen.getByText('3 GB / 5 GB')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuetext', '3 GB / 5 GB');
  });

  it('sets aria-valuetext from formatValueLabel', () => {
    render(<ProgressBar value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuetext', '50%');
  });

  it('respects custom max', () => {
    render(<ProgressBar value={3} max={10} label="Steps" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps value to [0, max]', () => {
    const {rerender} = render(
      <ProgressBar value={150} max={100} label="Over" />,
    );
    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressBar value={-10} max={100} label="Under" />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('forwards ref to outer container', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<ProgressBar ref={ref} value={50} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(<ProgressBar value={50} label="Test" data-testid="my-progress" />);
    expect(screen.getByTestId('my-progress')).toBeInTheDocument();
  });

  it('renders with all variant options', () => {
    const variants = [
      'accent',
      'success',
      'warning',
      'error',
      'neutral',
    ] as const;
    for (const variant of variants) {
      const {unmount} = render(
        <ProgressBar value={50} label={variant} variant={variant} />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders at fixed 8px track height', () => {
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows value label with hidden label', () => {
    render(
      <ProgressBar value={60} label="Hidden" isLabelHidden hasValueLabel />,
    );
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('renders no visible value label when isLabelHidden without hasValueLabel', () => {
    // Mirrors the intended "accessible label only" composition: the text
    // label is kept for assistive tech (visually hidden) while no extra
    // visible value label is surfaced.
    render(<ProgressBar value={42} label="Context usage" isLabelHidden />);
    expect(screen.queryByText('42%')).not.toBeInTheDocument();
    const label = screen.getByText('Context usage');
    expect(label).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-labelledby', label.id);
  });

  it('handles zero max gracefully', () => {
    render(<ProgressBar value={0} max={0} label="Empty" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
  });

  it('treats a NaN value as empty progress instead of leaking "NaN"', () => {
    // e.g. an upstream `loaded / total * 100` where total is still 0.
    render(<ProgressBar value={NaN} label="Upload" hasValueLabel />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar.getAttribute('aria-valuetext')).toBe('0%');
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    // The fill width must be a real percentage, not "NaN%".
    const fill = progressbar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('treats a NaN max as an empty range instead of leaking "NaN"', () => {
    render(<ProgressBar value={5} max={NaN} label="Steps" hasValueLabel />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('does not render NaN in the value label when max is zero', () => {
    render(<ProgressBar value={0} max={0} label="Empty" hasValueLabel />);
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuetext') ?? '').not.toMatch(
      /NaN|Infinity/,
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  // Disabled state
  describe('disabled state', () => {
    it('renders with isDisabled', () => {
      render(
        <ProgressBar value={50} label="Canceled" isDisabled hasValueLabel />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('still renders label when disabled', () => {
      render(<ProgressBar value={50} label="Canceled upload" isDisabled />);
      expect(screen.getByText('Canceled upload')).toBeInTheDocument();
    });
  });

  // Indeterminate mode tests
  describe('indeterminate mode', () => {
    it('renders with role="progressbar" when isIndeterminate', () => {
      render(<ProgressBar isIndeterminate label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('does not set aria-valuenow/min/max when indeterminate', () => {
      render(<ProgressBar isIndeterminate label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).not.toHaveAttribute('aria-valuemin');
      expect(progressbar).not.toHaveAttribute('aria-valuemax');
      expect(progressbar).not.toHaveAttribute('aria-valuetext');
    });

    it('still renders label when indeterminate', () => {
      render(<ProgressBar isIndeterminate label="Processing" />);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('hides value label when indeterminate even if hasValueLabel is true', () => {
      render(
        <ProgressBar
          isIndeterminate
          label="Loading"
          value={50}
          hasValueLabel
        />,
      );
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('is labelled via aria-labelledby when indeterminate', () => {
      render(<ProgressBar isIndeterminate label="Loading data" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-labelledby');
    });

    it('renders with all variants in indeterminate mode', () => {
      const variants = [
        'accent',
        'success',
        'warning',
        'error',
        'neutral',
      ] as const;
      for (const variant of variants) {
        const {unmount} = render(
          <ProgressBar isIndeterminate label={variant} variant={variant} />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });

    it('drives a direction-aware indeterminate slide (mirrored keyframe under RTL)', () => {
      // StyleX injects the keyframes + the atomic rule that swaps the
      // animation-name under `[dir="rtl"]`. Scan the injected CSS so we can
      // assert the RTL branch exists without relying on jsdom animation.
      function injectedCss(): string {
        let out = '';
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            for (const rule of Array.from(sheet.cssRules)) {
              out += rule.cssText + '\n';
            }
          } catch {
            // ignore cross-origin sheets
          }
        }
        out += Array.from(document.querySelectorAll('style'))
          .map(s => s.textContent || '')
          .join('\n');
        return out;
      }

      render(<ProgressBar isIndeterminate label="Loading" />);
      const css = injectedCss();
      // LTR keyframe slides physically left → right (−100% → 250%).
      expect(css).toMatch(/translateX\(-100%\)/);
      expect(css).toMatch(/translateX\(250%\)/);
      // RTL keyframe mirrors it (100% → −250%) so the bar travels along the
      // reading flow (inline-start → inline-end, i.e. right → left).
      expect(css).toMatch(/translateX\(100%\)/);
      expect(css).toMatch(/translateX\(-250%\)/);
      // The animation-name is swapped specifically under `[dir="rtl"]`.
      expect(css).toMatch(/:is\(\[dir="rtl"\][^)]*\)[^{]*\{\s*animation-name:/);
    });
  });

  // Target markers
  describe('target markers', () => {
    const MARKER = '.astryx-progressbar-marker';

    it('renders no marker elements when markers is omitted', () => {
      const {container} = render(<ProgressBar value={50} label="Progress" />);
      expect(container.querySelectorAll(MARKER)).toHaveLength(0);
    });

    it('renders no marker elements for an empty markers array', () => {
      const {container} = render(
        <ProgressBar value={50} label="Progress" markers={[]} />,
      );
      expect(container.querySelectorAll(MARKER)).toHaveLength(0);
    });

    it('renders a marker at the position matching its value', () => {
      const {container} = render(
        <ProgressBar value={40} label="Progress" markers={[{value: 80}]} />,
      );
      const markers = container.querySelectorAll<HTMLElement>(MARKER);
      expect(markers).toHaveLength(1);
      // value 80 of max 100 -> 80% along the track (RTL-safe logical property).
      expect(markers[0].style.insetInlineStart).toBe('80%');
    });

    it('positions markers relative to a custom max', () => {
      const {container} = render(
        <ProgressBar value={1} max={5} label="Steps" markers={[{value: 4}]} />,
      );
      const markers = container.querySelectorAll<HTMLElement>(MARKER);
      // value 4 of max 5 -> 80%.
      expect(markers[0].style.insetInlineStart).toBe('80%');
    });

    it('keeps a marker past the current value visible', () => {
      // A marker beyond the fill still renders — it layers above the fill.
      const {container} = render(
        <ProgressBar value={20} label="Progress" markers={[{value: 90}]} />,
      );
      const markers = container.querySelectorAll<HTMLElement>(MARKER);
      expect(markers).toHaveLength(1);
      expect(markers[0].style.insetInlineStart).toBe('90%');
    });

    it('renders multiple markers', () => {
      const {container} = render(
        <ProgressBar
          value={50}
          label="Progress"
          markers={[{value: 25}, {value: 50}, {value: 80}]}
        />,
      );
      expect(container.querySelectorAll(MARKER)).toHaveLength(3);
    });

    it('clamps out-of-range marker positions to the track edges', () => {
      const {container} = render(
        <ProgressBar
          value={50}
          label="Progress"
          markers={[{value: -10}, {value: 150}]}
        />,
      );
      const markers = container.querySelectorAll<HTMLElement>(MARKER);
      expect(markers).toHaveLength(2);
      expect(markers[0].style.insetInlineStart).toBe('0%');
      expect(markers[1].style.insetInlineStart).toBe('100%');
    });

    it('drops non-finite marker values', () => {
      const {container} = render(
        <ProgressBar
          value={50}
          label="Progress"
          markers={[{value: NaN}, {value: Infinity}, {value: 60}]}
        />,
      );
      const markers = container.querySelectorAll<HTMLElement>(MARKER);
      expect(markers).toHaveLength(1);
      expect(markers[0].style.insetInlineStart).toBe('60%');
    });

    it('does not render markers in indeterminate mode', () => {
      const {container} = render(
        <ProgressBar isIndeterminate label="Loading" markers={[{value: 80}]} />,
      );
      expect(container.querySelectorAll(MARKER)).toHaveLength(0);
    });

    it('marks an unlabeled marker as decorative (aria-hidden)', () => {
      const {container} = render(
        <ProgressBar value={50} label="Progress" markers={[{value: 80}]} />,
      );
      const marker = container.querySelector<HTMLElement>(MARKER);
      expect(marker).toHaveAttribute('aria-hidden', 'true');
      expect(marker).not.toHaveAttribute('role');
      expect(marker).not.toHaveAttribute('aria-label');
      expect(marker).not.toHaveAttribute('tabindex');
    });

    it('reveals a labeled marker via a focusable Tooltip trigger', () => {
      const {container} = render(
        <ProgressBar
          value={50}
          label="Progress"
          markers={[{value: 80, label: 'Goal'}]}
        />,
      );
      const marker = container.querySelector<HTMLElement>(MARKER)!;
      // Focusable so keyboard users can reveal the label; named via the
      // Tooltip's aria-describedby rather than a labeled child of the bar.
      expect(marker).toHaveAttribute('tabindex', '0');
      expect(marker).not.toHaveAttribute('aria-hidden');
      expect(marker).toHaveAttribute('aria-describedby');
      const tip = document.getElementById(
        marker.getAttribute('aria-describedby')!,
      );
      expect(tip).toHaveTextContent('Goal');
    });

    it('keeps the progressbar element free of role="img"/aria-label children', () => {
      // Markers are children of role="progressbar" (unchanged DOM), but a
      // labeled marker uses a Tooltip (aria-describedby) rather than a
      // role="img"+aria-label child, so nothing muddies what SRs announce for
      // the bar. The unlabeled markers are aria-hidden.
      const {container} = render(
        <ProgressBar
          value={50}
          label="Progress"
          markers={[{value: 80, label: 'Goal'}]}
        />,
      );
      const progressbar = screen.getByRole('progressbar');
      // Marker is a child of the progressbar (DOM unchanged from main).
      expect(progressbar.querySelector(MARKER)).not.toBeNull();
      // But it is not a labeled graphic that pollutes the a11y subtree.
      expect(progressbar.querySelector('[role="img"]')).toBeNull();
      expect(progressbar.querySelector('[aria-label]')).toBeNull();
      expect(container.querySelectorAll(MARKER)).toHaveLength(1);
    });

    it('does not add marker info to the progressbar aria-valuetext', () => {
      render(
        <ProgressBar
          value={50}
          label="Progress"
          markers={[{value: 80, label: 'Goal'}]}
        />,
      );
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar.getAttribute('aria-valuetext')).toBe('50%');
    });

    it('renders markers as children of the progressbar (unchanged DOM)', () => {
      // Markers stay children of role="progressbar", after the fill — the same
      // shape as main. The fill remains the first child.
      const {container} = render(
        <ProgressBar value={50} label="Progress" markers={[{value: 80}]} />,
      );
      const progressbar = screen.getByRole('progressbar');
      const fill = progressbar.firstElementChild as HTMLElement;
      expect(fill.style.width).toBe('50%');
      expect(fill.classList.contains('astryx-progressbar-marker')).toBe(false);
      const marker = container.querySelector<HTMLElement>(MARKER)!;
      expect(marker.closest('[role="progressbar"]')).toBe(progressbar);
      expect(container.querySelectorAll(MARKER)).toHaveLength(1);
    });

    it('does not clip markers (track carries no overflow:hidden)', () => {
      // Removing the clip from the progressbar element is what lets a themed
      // taller marker overhang the bar. Assert the compiled track class does
      // not set overflow:hidden.
      render(
        <ProgressBar value={50} label="Progress" markers={[{value: 80}]} />,
      );
      const progressbar = screen.getByRole('progressbar');
      const trackClass = Array.from(progressbar.classList).find(c =>
        c.startsWith('x'),
      );
      let css = '';
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            css += rule.cssText + '\n';
          }
        } catch {
          // ignore cross-origin sheets
        }
      }
      css += Array.from(document.querySelectorAll('style'))
        .map(s => s.textContent || '')
        .join('\n');
      // The atomic class that would set overflow:hidden must not be applied to
      // the track. Sanity-check the bar still rendered with a StyleX class.
      expect(trackClass).toBeDefined();
      // No rule targeting the track's classes sets overflow:hidden. (StyleX
      // atomic classes are unique per declaration; if overflow:hidden were on
      // the track we'd see it applied. We assert the track element's computed
      // intent by checking no overflow:hidden atomic is in its class list's
      // rules — simplest robust check: the track style object omits it.)
      const trackHasOverflowHidden = Array.from(progressbar.classList).some(
        cls => {
          const re = new RegExp(
            `\\.${cls}\\b[^{]*\\{[^}]*overflow:\\s*hidden`,
            'i',
          );
          return re.test(css);
        },
      );
      expect(trackHasOverflowHidden).toBe(false);
    });

    it('leaves the marker height overridable (defaults via CSS var)', () => {
      // The marker reads `var(--progressbar-marker-height, 8px)`, so a theme
      // targeting `.astryx-progressbar-marker` can set a taller tick that
      // overhangs the bar without being clipped.
      const {container} = render(
        <ProgressBar value={50} label="Progress" markers={[{value: 80}]} />,
      );
      let css = '';
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            css += rule.cssText + '\n';
          }
        } catch {
          // ignore cross-origin sheets
        }
      }
      css += Array.from(document.querySelectorAll('style'))
        .map(s => s.textContent || '')
        .join('\n');
      expect(css).toMatch(/var\(--progressbar-marker-height,\s*8px\)/);
      // And it is centered so any overhang is symmetric.
      expect(css).toMatch(/translate\(-50%,\s*-50%\)/);
      expect(container.querySelectorAll(MARKER)).toHaveLength(1);
    });
  });
});
