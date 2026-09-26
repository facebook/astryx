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

describe('CodeBlock theme target names', () => {
  it('renders the deprecated classes beside the current ones', () => {
    const {container} = render(
      <CodeBlock
        code="const x = 1;"
        language="javascript"
        title="example.js"
      />,
    );
    expect(container.querySelector('.astryx-code-block')).toHaveClass(
      'astryx-codeblock',
    );
    expect(container.querySelector('.astryx-code-block-header')).toHaveClass(
      'astryx-codeblock-header',
    );
    expect(container.querySelector('.astryx-code-block-title')).toHaveClass(
      'astryx-codeblock-title',
    );
    expect(screen.getByRole('button', {name: 'Copy code'})).toHaveClass(
      'astryx-code-block-copy-button',
    );
  });

  it('reaches the header and title through the current defineTheme keys', () => {
    const theme = defineTheme({
      name: 'code-block-header-target-test',
      components: {
        'code-block-header': {base: {paddingBlock: 'var(--spacing-1)'}},
        'code-block-title': {base: {fontSize: 'var(--text-body-size)'}},
      },
    });
    const css = generateThemeTestCSS(theme);
    expect(css).toContain('.astryx-code-block-header');
    expect(css).toContain('.astryx-code-block-title');
  });
});
