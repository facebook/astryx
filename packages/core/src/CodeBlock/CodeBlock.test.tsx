// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CodeBlock.test.tsx
 * @input Uses vitest, @testing-library/react, CodeBlock component
 * @output Unit tests for CodeBlock (copy button, collapse, scroll region a11y, syntaxTheme)
 * @position Testing; validates CodeBlock implementation
 *
 * SYNC: When CodeBlock.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render, screen, fireEvent, waitFor} from '@testing-library/react';
import {CodeBlock} from './CodeBlock';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';
import {dracula} from '../theme/syntax';
import {InternationalizationProvider} from '../i18n';
import {defineTheme} from '../theme/defineTheme';
import {generateThemeCSS} from '../theme/generateThemeRules';

function generateThemeTestCSS(theme: Parameters<typeof generateThemeCSS>[0]) {
  const {prose, component} = generateThemeCSS(theme);
  return [prose, component].filter(Boolean).join('\n\n');
}

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}

// A code sample long enough to exceed the default collapsible threshold (10).
const LONG_CODE = Array.from(
  {length: 15},
  (_, i) => `const line${i} = ${i};`,
).join('\n');

describe('CodeBlock', () => {
  beforeEach(() => {
    // jsdom does not implement the async Clipboard API.
    Object.assign(navigator, {
      clipboard: {writeText: vi.fn().mockResolvedValue(undefined)},
    });
  });

  afterEach(() => {
    __resetLiveRegionsForTest();
  });

  it('renders the code', () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    expect(screen.getByText(/const/)).toBeInTheDocument();
  });

  it('makes the scroll container keyboard-focusable', () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    const region = screen.getByRole('group');
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveAttribute('aria-label', 'javascript');
  });

  it('labels the scroll region "Code" when no language label is shown', () => {
    render(<CodeBlock code="hello" hasLanguageLabel={false} />);
    const region = screen.getByRole('group');
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveAttribute('aria-label', 'Code');
  });

  it('copies code when the copy button is clicked', () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it('renders the copy button as a themeable target with a "Copy code" tooltip', () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    // Theme seam: a design system can restyle the copy control via this class
    // without turning the button off and re-implementing it.
    expect(copyButton).toHaveClass('astryx-codeblock-copy-button');
    // The button carries a visible "Copy code" hover/focus hint (tooltip),
    // wired through aria-describedby — a bare <button> could not.
    expect(copyButton).toHaveAttribute('aria-describedby');
  });

  it('keeps the copy button tooltip as "Copy code" after copying', async () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
    await act(async () => {});
    // The icon flip (copy → check) is the confirmation; the tooltip text does
    // not change. The accessible name still swaps to "Copied" for AT.
    const copyButton = screen.getByRole('button', {name: 'Copied'});
    const tooltipId = copyButton.getAttribute('aria-describedby');
    expect(tooltipId).toBeTruthy();
    const tooltip = document.getElementById(tooltipId as string);
    expect(tooltip).toHaveTextContent('Copy code');
  });

  it('announces "Copied" to a polite live region after copying', async () => {
    render(<CodeBlock code="const x = 1;" language="javascript" />);
    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('Copied');
    });
  });

  it('localizes the copy announcement through the i18n catalog', async () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{fr: {'@astryx.codeBlock.copied': 'Copié'}}}>
        <CodeBlock code="const x = 1;" language="javascript" />
      </InternationalizationProvider>,
    );
    // The button label and the live-region announcement share the same key.
    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
    await waitFor(() => {
      expect(politeRegion()).toHaveTextContent('Copié');
    });
    expect(screen.getByRole('button', {name: 'Copié'})).toBeInTheDocument();
  });

  it('keeps the copied indicator a full 2s after a rapid re-copy', async () => {
    vi.useFakeTimers();
    try {
      render(<CodeBlock code="const x = 1;" language="javascript" />);
      fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
      // Flush the async clipboard write.
      await act(async () => {});
      expect(screen.getByRole('button', {name: 'Copied'})).toBeInTheDocument();

      // 1.5s later the user copies again.
      act(() => {
        vi.advanceTimersByTime(1500);
      });
      fireEvent.click(screen.getByRole('button', {name: 'Copied'}));
      await act(async () => {});

      // 600ms after the second copy (2.1s after the first): the first
      // click's timer must not have reverted the indicator early.
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.getByRole('button', {name: 'Copied'})).toBeInTheDocument();

      // It resets 2s after the most recent copy.
      act(() => {
        vi.advanceTimersByTime(1400);
      });
      expect(
        screen.getByRole('button', {name: 'Copy code'}),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does NOT collapse the block when the copy button is clicked', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    // The collapsible header exposes aria-expanded.
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'));
    expect(header).toBeTruthy();
    expect(header).toHaveAttribute('aria-expanded', 'true');

    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    fireEvent.click(copyButton);

    // Clicking Copy must not toggle the collapsible header.
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('does not nest the copy button inside the collapsible header role="button"', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'));
    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    expect(header).toBeTruthy();
    // The copy button must be a sibling, not a descendant of the interactive
    // header — nested interactive controls are invalid ARIA.
    expect(header!.contains(copyButton)).toBe(false);
  });

  it('still toggles collapse when the header itself is clicked', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'))!;
    expect(header).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('links the collapsible header to its code region via aria-controls', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'))!;
    const controlsId = header.getAttribute('aria-controls');
    // aria-controls must be present and point at the real code region.
    expect(controlsId).toBeTruthy();
    const region = document.getElementById(controlsId as string);
    expect(region).not.toBeNull();
    // The region contains the scrollable code body (role="group").
    expect(region).toContainElement(screen.getByRole('group'));
  });

  it('keeps aria-controls resolvable when collapsed (region stays mounted)', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'))!;
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    // The code region uses a CSS grid animation to collapse, so it stays in
    // the DOM — aria-controls stays a valid, resolvable reference (unlike a
    // conditionally-mounted region, which would need a conditional attribute).
    const controlsId = header.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId as string)).not.toBeNull();
  });

  it('makes the collapsed region inert so the scroll container is unreachable', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'))!;
    const region = document.getElementById(
      header.getAttribute('aria-controls') as string,
    )!;
    // Expanded: the region is not inert and the scroll container is reachable.
    expect(region).not.toHaveAttribute('inert');

    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    // Collapsed: the wrapper is inert, so the keyboard-focusable scroll
    // container (tabIndex=0) inside it drops out of the tab order and the
    // accessibility tree instead of remaining an invisible tab stop.
    expect(region).toHaveAttribute('inert');
    const scrollContainer = screen.getByRole('group');
    expect(scrollContainer.closest('[inert]')).toBe(region);
  });

  it('restores focusability of the scroll container after expanding again', () => {
    render(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    const header = screen
      .getAllByRole('button')
      .find(el => el.hasAttribute('aria-expanded'))!;
    const region = document.getElementById(
      header.getAttribute('aria-controls') as string,
    )!;
    // Collapse, then expand again.
    fireEvent.click(header);
    expect(region).toHaveAttribute('inert');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    // Expanded again: inert is removed and the scroll container is a
    // keyboard-focusable group once more.
    expect(region).not.toHaveAttribute('inert');
    const scrollContainer = screen.getByRole('group');
    expect(scrollContainer.closest('[inert]')).toBeNull();
    expect(scrollContainer).toHaveAttribute('tabindex', '0');
  });

  it('applies a per-instance syntax theme via the syntaxTheme prop', () => {
    const {container} = render(
      <CodeBlock
        code="const x = 1;"
        language="javascript"
        syntaxTheme={dracula}
      />,
    );
    const wrapper = container.querySelector('[data-astryx-syntax-theme]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('data-astryx-syntax-theme', 'dracula');
    expect(wrapper!.querySelector('pre')).not.toBeNull();
  });

  it('renders no syntax theme wrapper when syntaxTheme is not set', () => {
    const {container} = render(
      <CodeBlock code="const x = 1;" language="javascript" />,
    );
    expect(container.querySelector('[data-astryx-syntax-theme]')).toBeNull();
    expect(container.firstElementChild?.tagName).toBe('PRE');
  });

  describe('header theming targets', () => {
    it('puts astryx-codeblock-header on the header row when a header shows', () => {
      const {container} = render(
        <CodeBlock
          code="const x = 1;"
          language="javascript"
          title="example.js"
        />,
      );
      expect(
        container.querySelector('.astryx-codeblock-header'),
      ).not.toBeNull();
    });

    it('puts astryx-codeblock-title on the header title element', () => {
      const {container} = render(
        <CodeBlock
          code="const x = 1;"
          language="javascript"
          title="example.js"
        />,
      );
      const titleEl = container.querySelector('.astryx-codeblock-title');
      expect(titleEl).not.toBeNull();
      // The language label + title text live in this element.
      expect(titleEl).toHaveTextContent('example.js');
    });

    it('renders no header targets when there is no header', () => {
      // plaintext hides the language label and no title is given, so the
      // header row is not rendered at all.
      const {container} = render(
        <CodeBlock code="const x = 1;" language="plaintext" />,
      );
      expect(container.querySelector('.astryx-codeblock-header')).toBeNull();
      expect(container.querySelector('.astryx-codeblock-title')).toBeNull();
    });

    it('exposes the header and title as themeable defineTheme targets', () => {
      // jsdom can't resolve the @layer cascade, so this asserts the targets are
      // reachable by a theme via the sanctioned defineTheme channel — replacing
      // the structural `> div:first-child > div > span` header/title selectors a
      // consumer would otherwise need to restyle the header padding and title.
      const theme = defineTheme({
        name: 'codeblock-header-target-test',
        components: {
          'codeblock-header': {
            base: {paddingBlock: 'var(--spacing-1)'},
          },
          'codeblock-title': {
            base: {fontSize: 'var(--text-body-size)'},
          },
        },
      });
      const css = generateThemeTestCSS(theme);
      expect(css).toContain('.astryx-codeblock-header');
      expect(css).toContain('.astryx-codeblock-title');
    });
  });
});

const LINES = 'line one\nline two\nline three\nline four';
const MINUS = '−'; // U+2212 minus sign, the remove marker glyph.

function getLine(container: HTMLElement, line: number): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[data-line="${line}"]`);
  if (el == null) {
    throw new Error(`line ${line} not rendered`);
  }
  return el;
}

describe('CodeBlock highlightLines', () => {
  it('renders plain number arrays with the neutral accent (backward compat)', () => {
    const {container} = render(
      <CodeBlock code={LINES} highlightLines={[2, 3]} />,
    );
    expect(getLine(container, 1).dataset.lineType).toBeUndefined();
    expect(getLine(container, 2).dataset.lineType).toBe('highlight');
    expect(getLine(container, 3).dataset.lineType).toBe('highlight');
    // A neutral highlight is not a diff, so no marker gutter is drawn.
    expect(container.querySelector('[data-diff-marker]')).toBeNull();
  });

  it('renders mixed numbers and {line, type} entries with per-type accents', () => {
    const {container} = render(
      <CodeBlock
        code={LINES}
        highlightLines={[
          1,
          {line: 2, type: 'add'},
          {line: 3, type: 'remove'},
          {line: 4, type: 'highlight'},
        ]}
      />,
    );
    expect(getLine(container, 1).dataset.lineType).toBe('highlight');
    expect(getLine(container, 2).dataset.lineType).toBe('add');
    expect(getLine(container, 3).dataset.lineType).toBe('remove');
    expect(getLine(container, 4).dataset.lineType).toBe('highlight');

    // Each accent type gets distinct styling; a plain number matches an
    // explicit 'highlight'.
    expect(getLine(container, 2).className).not.toBe(
      getLine(container, 3).className,
    );
    expect(getLine(container, 1).className).toBe(
      getLine(container, 4).className,
    );
  });

  it('defaults {line} without a type to the neutral accent', () => {
    const {container} = render(
      <CodeBlock code={LINES} highlightLines={[1, {line: 2}]} />,
    );
    expect(getLine(container, 2).dataset.lineType).toBe('highlight');
    expect(getLine(container, 2).className).toBe(
      getLine(container, 1).className,
    );
  });

  it('ignores out-of-range lines', () => {
    const {container} = render(
      <CodeBlock
        code={LINES}
        highlightLines={[
          {line: 99, type: 'add'},
          {line: 0, type: 'remove'},
          -5,
        ]}
      />,
    );
    expect(container.querySelector('[data-line="99"]')).toBeNull();
    expect(container.querySelector('[data-line-type]')).toBeNull();
  });
});

describe('CodeBlock diff markers', () => {
  it('draws +/- gutter markers on add/remove lines (non-colour affordance)', () => {
    const {container} = render(
      <CodeBlock
        code={LINES}
        highlightLines={[
          {line: 2, type: 'add'},
          {line: 3, type: 'remove'},
        ]}
      />,
    );
    expect(getLine(container, 2).dataset.diffMarker).toBe('+');
    expect(getLine(container, 3).dataset.diffMarker).toBe(MINUS);
    // Every line carries a marker cell (blank for context) so the gutter aligns.
    expect(getLine(container, 1).dataset.diffMarker).toBe('');
    expect(getLine(container, 4).dataset.diffMarker).toBe('');
  });

  it('does not draw markers for a neutral-only highlight', () => {
    const {container} = render(
      <CodeBlock
        code={LINES}
        highlightLines={[{line: 2, type: 'highlight'}, 3]}
      />,
    );
    expect(container.querySelector('[data-diff-marker]')).toBeNull();
  });

  it('does not switch on the marker gutter for an out-of-range typed entry', () => {
    // LINES has 4 lines; line 99 doesn't exist, so its add accent must not enable the gutter.
    const {container} = render(
      <CodeBlock code={LINES} highlightLines={[{line: 99, type: 'add'}]} />,
    );
    expect(container.querySelector('[data-diff-marker]')).toBeNull();
  });
});

describe('CodeBlock language="diff"', () => {
  const DIFF = [
    '@@ -1,3 +1,3 @@',
    ' {',
    '-  "timeout": 10,',
    '+  "timeout": 30,',
    ' }',
  ].join('\n');

  it('derives add/remove accents and markers from a unified diff', () => {
    const {container} = render(<CodeBlock code={DIFF} language="diff" />);
    expect(getLine(container, 3).dataset.lineType).toBe('remove');
    expect(getLine(container, 3).dataset.diffMarker).toBe(MINUS);
    expect(getLine(container, 4).dataset.lineType).toBe('add');
    expect(getLine(container, 4).dataset.diffMarker).toBe('+');
    // Hunk/file headers are metadata: no accent, no marker glyph.
    expect(getLine(container, 1).dataset.lineType).toBeUndefined();
    expect(getLine(container, 1).dataset.diffMarker).toBe('');
  });

  it('strips the leading +/- from the displayed code', () => {
    const {container} = render(<CodeBlock code={DIFF} language="diff" />);
    expect(getLine(container, 3).textContent).toBe('  "timeout": 10,');
    expect(getLine(container, 4).textContent).toBe('  "timeout": 30,');
    expect(getLine(container, 3).textContent?.startsWith('-')).toBe(false);
  });

  it('copies the post-image — context + added, no removed lines or metadata', () => {
    render(<CodeBlock code={DIFF} language="diff" />);
    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
    // The removed `"timeout": 10` line is NOT in the resulting file; only context + added lines are.
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '{\n  "timeout": 30,\n}',
    );
  });

  it('re-arms header detection across a multi-file patch', () => {
    // The 2nd file's diff/---/+++ headers must be metadata, not treated as in-hunk content.
    const diff = [
      'diff --git a/f1 b/f1',
      '--- a/f1',
      '+++ b/f1',
      '@@ -1 +1 @@',
      '-a',
      '+b',
      'diff --git a/f2 b/f2',
      '--- a/f2',
      '+++ b/f2',
      '@@ -1 +1 @@',
      '-c',
      '+d',
    ].join('\n');
    const {container} = render(<CodeBlock code={diff} language="diff" />);
    // 2nd file's header lines are metadata (the multi-file fix), not add/remove content.
    expect(getLine(container, 7).dataset.lineType).toBeUndefined(); // diff --git a/f2
    expect(getLine(container, 8).dataset.lineType).toBeUndefined(); // --- a/f2
    expect(getLine(container, 9).dataset.lineType).toBeUndefined(); // +++ b/f2
    expect(getLine(container, 11).dataset.lineType).toBe('remove');
    expect(getLine(container, 12).dataset.lineType).toBe('add');
    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('b\nd'); // post-image of both files
  });

  it('treats ---/+++ inside a hunk as content, not file headers', () => {
    // A removed line whose content is `--` (wire `---`) and an added `++` (wire `+++`).
    const diff = ['@@ -1 +1 @@', '---', '+++'].join('\n');
    const {container} = render(<CodeBlock code={diff} language="diff" />);
    expect(getLine(container, 2).dataset.lineType).toBe('remove');
    expect(getLine(container, 2).textContent).toBe('--');
    expect(getLine(container, 3).dataset.lineType).toBe('add');
    expect(getLine(container, 3).textContent).toBe('++');
  });

  it('tolerates CRLF and excludes the no-newline sentinel from copy', () => {
    const diff = [
      '@@ -1 +1 @@\r',
      ' ctx\r',
      '-old\r',
      '+new\r',
      '\\ No newline at end of file',
    ].join('\n');
    const {container} = render(<CodeBlock code={diff} language="diff" />);
    expect(getLine(container, 3).textContent).toBe('old'); // no dangling \r
    expect(getLine(container, 4).dataset.lineType).toBe('add');
    expect(getLine(container, 5).dataset.lineType).toBeUndefined(); // sentinel is metadata
    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
    // Post-image = context + added, CRLF normalized, sentinel dropped.
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ctx\nnew');
  });
});
