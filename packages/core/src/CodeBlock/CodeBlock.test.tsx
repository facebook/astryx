// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CodeBlock.test.tsx
 * @input Uses vitest, @testing-library/react, CodeBlock component
 * @output Unit tests for CodeBlock (copy button, collapse, scroll region a11y, syntaxTheme)
 * @position Testing; validates CodeBlock implementation
 *
 * SYNC: When CodeBlock.tsx changes, update tests to match new behavior
 */

import {createRoot, hydrateRoot, type Root} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
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

function selectText(node: Node): string {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(node);
  selection?.removeAllRanges();
  selection?.addRange(range);
  const text = selection?.toString() ?? '';
  selection?.removeAllRanges();
  return text;
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

  it('expands when rerendering removes the collapse control', () => {
    const {rerender} = render(
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
    expect(screen.getByRole('group').closest('[inert]')).not.toBeNull();

    rerender(<CodeBlock code={LONG_CODE} language="plaintext" isCollapsible />);
    expect(
      screen
        .queryAllByRole('button')
        .find(el => el.hasAttribute('aria-expanded')),
    ).toBeUndefined();
    expect(screen.getByRole('group').closest('[inert]')).toBeNull();

    rerender(
      <CodeBlock
        code={LONG_CODE}
        language="javascript"
        title="example"
        isCollapsible
      />,
    );
    expect(
      screen
        .getAllByRole('button')
        .find(el => el.hasAttribute('aria-expanded')),
    ).toHaveAttribute('aria-expanded', 'true');
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

  it.each(['spans', 'ranges'] as const)(
    'preserves exact DOM text in %s mode',
    highlightMode => {
      const code = 'const alpha = 1;\nlet beta = 2;\n\nreturn gamma;\n';
      const {container} = render(
        <CodeBlock
          code={code}
          language="javascript"
          hasLanguageLabel={false}
          highlightMode={highlightMode}
        />,
      );

      const codeElement = container.querySelector('code');
      expect(codeElement?.textContent).toBe(code);
      expect(selectText(codeElement!)).toBe(code);
      expect(container.querySelectorAll('[data-line]')).toHaveLength(4);
      expect(codeElement?.querySelector('br')).toBeNull();
      const follower = codeElement?.querySelector(
        '[data-astryx-code-selection-follower]',
      );
      expect(follower?.tagName).toBe('METER');
      expect(follower).toHaveAttribute('min', '0');
      expect(follower).toHaveAttribute('max', '1');
      expect(follower).toHaveAttribute('value', '0');
      expect(follower).toHaveAttribute('aria-hidden', 'true');
      expect(container.textContent).not.toContain('\u200b');
      if (highlightMode === 'spans') {
        expect(
          codeElement?.querySelector('.astryx-token-keyword'),
        ).not.toBeNull();
      }
    },
  );

  it.each(['spans', 'ranges'] as const)(
    'preserves newlines across rendering chunks in %s mode',
    highlightMode => {
      const code =
        Array.from({length: 105}, (_, index) => `line ${index + 1}`).join(
          '\n',
        ) + '\n';
      const {container} = render(
        <CodeBlock
          code={code}
          language="plaintext"
          highlightMode={highlightMode}
        />,
      );

      const codeElement = container.querySelector('code');
      expect(codeElement?.textContent).toBe(code);
      expect(selectText(codeElement!)).toBe(code);
      expect(container.querySelectorAll('[data-line]')).toHaveLength(105);
    },
  );

  it.each(['spans', 'ranges'] as const)(
    'preserves CRLF source text in %s mode',
    highlightMode => {
      const code = 'const alpha = 1;\r\n\r\nlet beta = 2;\r\n';
      const {container} = render(
        <CodeBlock
          code={code}
          language="javascript"
          hasLanguageLabel={false}
          hasLineNumbers
          isWrapped
          highlightMode={highlightMode}
        />,
      );

      const codeElement = container.querySelector('code');
      expect(codeElement?.textContent).toBe(code);
      expect(selectText(codeElement!)).toBe(code);
      expect(container.querySelectorAll('[data-line]')).toHaveLength(3);
      const separators = Array.from(
        codeElement?.querySelectorAll('[data-astryx-code-separator]') ?? [],
      );
      expect(separators).toHaveLength(3);
      expect(separators.map(node => node.textContent)).toEqual([
        '\r\n',
        '\r\n',
        '\r\n',
      ]);
      expect(
        separators.map(node => node.getAttribute('data-astryx-code-separator')),
      ).toEqual(['crlf', 'crlf', 'crlf']);
    },
  );

  it.each(['spans', 'ranges'] as const)(
    'restores SSR CRLF and client-renders without HTML sinks in %s mode',
    async highlightMode => {
      const code = 'const alpha = 1;\r\n\r\nlet beta = 2;\r\n';
      const element = (
        <CodeBlock
          code={code}
          language="javascript"
          hasCopyButton={false}
          hasLanguageLabel={false}
          hasLineNumbers
          isWrapped
          highlightMode={highlightMode}
        />
      );
      const host = document.createElement('div');
      host.innerHTML = renderToString(element);
      const clientHost = document.createElement('div');
      document.body.append(host, clientHost);

      const serverCode = code.replace(/\r\n/g, '\n');
      expect(host.querySelector('code')?.textContent).toBe(serverCode);
      expect(
        Array.from(
          host.querySelectorAll('[data-astryx-code-separator="crlf"]'),
        ).map(node => node.textContent),
      ).toEqual(['\n', '\n', '\n']);

      const innerHTMLDescriptor = Object.getOwnPropertyDescriptor(
        Element.prototype,
        'innerHTML',
      );
      expect(innerHTMLDescriptor).toBeDefined();
      Object.defineProperty(Element.prototype, 'innerHTML', {
        ...innerHTMLDescriptor,
        set() {
          throw new TypeError('Trusted Types blocked innerHTML');
        },
      });

      const recoverableErrors: unknown[] = [];
      let root: Root | null = null;
      let clientRoot: Root | null = null;
      try {
        await act(async () => {
          root = hydrateRoot(host, element, {
            onRecoverableError: error => recoverableErrors.push(error),
          });
          clientRoot = createRoot(clientHost);
          clientRoot.render(element);
        });

        for (const codeElement of [
          host.querySelector('code'),
          clientHost.querySelector('code'),
        ]) {
          expect(codeElement?.textContent).toBe(code);
          expect(selectText(codeElement!)).toBe(code);
        }
        expect(recoverableErrors).toEqual([]);
      } finally {
        await act(async () => {
          root?.unmount();
          clientRoot?.unmount();
        });
        Object.defineProperty(
          Element.prototype,
          'innerHTML',
          innerHTMLDescriptor!,
        );
        host.remove();
        clientHost.remove();
      }
    },
  );

  it('keeps range token text separate from exact line separators', () => {
    const {container} = render(
      <CodeBlock
        code={'alpha\n\nbeta'}
        language="plaintext"
        highlightMode="ranges"
      />,
    );
    const lines = container.querySelectorAll('[data-line]');
    const lineContent = (line: Element) => line.firstElementChild!;

    expect(lineContent(lines[0]).firstChild?.nodeType).toBe(Node.TEXT_NODE);
    expect(lineContent(lines[0]).firstChild?.textContent).toBe('alpha');
    expect(
      lineContent(lines[0]).querySelector('[data-astryx-code-separator]')
        ?.textContent,
    ).toBe('\n');
    expect(lineContent(lines[1]).firstElementChild).toHaveAttribute(
      'data-astryx-code-separator',
      'lf',
    );
    expect(lineContent(lines[1]).firstChild?.textContent).toBe('\n');
    expect(lineContent(lines[2]).firstChild?.textContent).toBe('beta');
    expect(container.querySelector('br')).toBeNull();
    expect(
      container.querySelector('[data-astryx-code-selection-follower]'),
    ).toBeNull();
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
