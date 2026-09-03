// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contentWidth.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Unit tests for Layout contentWidth prop
 */

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Layout} from '../Layout';
import {LayoutHeader} from '../LayoutHeader';
import {LayoutFooter} from '../LayoutFooter';
import {LayoutContent} from '../LayoutContent';
import {LayoutPanel} from '../LayoutPanel';

function Widget({height: _height}: {height?: 'auto' | 'fill'}) {
  return <div data-testid="widget">Widget</div>;
}

function WrappedContent() {
  return (
    <LayoutContent height="auto" data-testid="wrapped-content">
      Wrapped
    </LayoutContent>
  );
}

function NestedContent() {
  return (
    <div data-testid="content-wrapper">
      <LayoutContent height="auto" data-testid="nested-content">
        Nested
      </LayoutContent>
    </div>
  );
}

function SwitchingContent() {
  const [isRegion, setIsRegion] = useState(false);
  return isRegion ? (
    <LayoutContent height="auto">
      <button type="button" onClick={() => setIsRegion(false)}>
        Reset root
      </button>
    </LayoutContent>
  ) : (
    <button type="button" onClick={() => setIsRegion(true)}>
      Use region root
    </button>
  );
}

describe('Layout contentWidth', () => {
  describe('Layout', () => {
    it('observes only direct slot roots instead of the Layout subtree', () => {
      const observe = vi.fn();
      const disconnect = vi.fn();
      const OriginalMutationObserver = globalThis.MutationObserver;
      vi.stubGlobal(
        'MutationObserver',
        class {
          constructor(_callback: MutationCallback) {}
          observe = observe;
          disconnect = disconnect;
          takeRecords = vi.fn(() => []);
        },
      );

      try {
        render(
          <Layout
            content={<LayoutContent height="auto">Body</LayoutContent>}
          />,
        );

        expect(observe).toHaveBeenCalled();
        for (const [, options] of observe.mock.calls) {
          expect(options).not.toHaveProperty('subtree', true);
        }
      } finally {
        vi.stubGlobal('MutationObserver', OriginalMutationObserver);
      }
    });

    it('keeps the released independent-scroll default for single-column content', () => {
      render(
        <Layout
          contentWidth={640}
          content={
            <LayoutContent data-testid="content-region">Body</LayoutContent>
          }
        />,
      );

      const contentRegion = screen.getByTestId('content-region');
      const middleRow = contentRegion.parentElement!.parentElement!;

      expect(contentRegion).toHaveTextContent('Body');
      expect(middleRow).not.toHaveAttribute('role');
      expect(middleRow).not.toHaveAttribute('tabindex');
    });

    it('preserves isScrollable=false without changing fill-height ownership', () => {
      render(
        <Layout
          content={
            <LayoutContent isScrollable={false} data-testid="static-content">
              Body
            </LayoutContent>
          }
        />,
      );

      expect(screen.queryByRole('group')).not.toBeInTheDocument();
      expect(
        getComputedStyle(screen.getByTestId('static-content')).overflow,
      ).toBe('clip');
      expect(
        getComputedStyle(screen.getByTestId('static-content')).height,
      ).toBe('100%');
    });

    it('preserves LayoutPanel isScrollable=false without changing fill-height ownership', () => {
      render(
        <Layout
          start={
            <LayoutPanel isScrollable={false} data-testid="static-panel">
              Navigation
            </LayoutPanel>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );

      expect(screen.queryByRole('group')).not.toBeInTheDocument();
      expect(
        getComputedStyle(screen.getByTestId('static-panel')).overflow,
      ).toBe('clip');
      expect(getComputedStyle(screen.getByTestId('static-panel')).height).toBe(
        '100%',
      );
    });

    it('keeps height and overflow controls independent', () => {
      render(
        <Layout
          content={
            <LayoutContent
              height="auto"
              isScrollable={false}
              data-testid="natural-static-content">
              Body
            </LayoutContent>
          }
        />,
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(
        getComputedStyle(screen.getByTestId('natural-static-content')).overflow,
      ).toBe('clip');
      expect(
        getComputedStyle(screen.getByTestId('natural-static-content')).height,
      ).toBe('auto');
    });

    it('uses the middle scrollport when content uses natural height', () => {
      render(
        <Layout
          contentWidth={640}
          content={
            <LayoutContent
              height="auto"
              label="Document"
              data-testid="content-region">
              <span data-testid="body">Body</span>
            </LayoutContent>
          }
        />,
      );

      const contentRegion = screen.getByTestId('content-region');
      const middleRow = screen.getByRole('group', {name: 'Document'});

      expect(screen.getByTestId('body').parentElement).toBe(contentRegion);
      expect(middleRow).toHaveAttribute('role', 'group');
      expect(middleRow).toHaveAttribute('aria-label', 'Document');
      expect(middleRow).toHaveAttribute('tabindex', '0');
      expect(getComputedStyle(middleRow).overflow).toBe('auto');
      expect(getComputedStyle(middleRow).scrollbarGutter).toBe(
        'stable both-edges',
      );
    });

    it('supports percentage widths in the middle scrollport', () => {
      render(
        <Layout
          contentWidth="50%"
          content={
            <LayoutContent height="auto" data-testid="content-region">
              Body
            </LayoutContent>
          }
        />,
      );

      const middleRow = screen.getByRole('group');
      expect(middleRow).toHaveAttribute('role', 'group');
    });

    it('keeps bare CSS variable widths on the constrained path', () => {
      const {rerender} = render(
        <Layout
          contentWidth="var(--page-width)"
          content={
            <LayoutContent height="auto" data-testid="content-region">
              Body
            </LayoutContent>
          }
        />,
      );

      const middleRow = () => screen.getByRole('group');
      const variableWidthClassName = middleRow().className;

      rerender(
        <Layout
          contentWidth="fit-content"
          content={
            <LayoutContent height="auto" data-testid="content-region">
              Body
            </LayoutContent>
          }
        />,
      );

      expect(middleRow()).toHaveAttribute('role', 'group');
      expect(middleRow().className).toBe(variableWidthClassName);
    });

    it('expands calculated CSS variable widths', () => {
      render(
        <Layout
          contentWidth="calc(var(--page-width))"
          content={
            <LayoutContent height="auto" data-testid="content-region">
              Body
            </LayoutContent>
          }
        />,
      );

      expect(getComputedStyle(screen.getByRole('group')).scrollbarGutter).toBe(
        'stable both-edges',
      );
    });

    it('keeps intrinsic width keywords on the constrained middle scrollport', () => {
      const {rerender} = render(
        <Layout
          contentWidth="fit-content"
          content={
            <LayoutContent height="auto" data-testid="content-region">
              Body
            </LayoutContent>
          }
        />,
      );

      const middleRow = () => screen.getByRole('group');
      const fitContentClassName = middleRow().className;

      rerender(
        <Layout
          contentWidth="max-content"
          content={
            <LayoutContent height="auto" data-testid="content-region">
              Body
            </LayoutContent>
          }
        />,
      );

      expect(middleRow()).toHaveAttribute('role', 'group');
      expect(middleRow().className).toBe(fitContentClassName);
    });

    it('supports mixed independent and middle-scroll regions', () => {
      render(
        <Layout
          contentWidth={640}
          start={
            <LayoutPanel isScrollable data-testid="start-region">
              Navigation
            </LayoutPanel>
          }
          content={
            <LayoutContent height="auto" data-testid="content-region">
              Body
            </LayoutContent>
          }
          end={
            <LayoutPanel height="auto" data-testid="end-region">
              Details
            </LayoutPanel>
          }
        />,
      );

      const middleRow = screen.getByRole('group');

      expect(middleRow).toHaveAttribute('role', 'group');
      expect(
        getComputedStyle(screen.getByTestId('start-region').parentElement!)
          .position,
      ).toBe('sticky');
      expect(getComputedStyle(screen.getByTestId('end-region')).height).toBe(
        'auto',
      );
      expect(
        getComputedStyle(screen.getByTestId('end-region')).alignSelf,
      ).not.toBe('flex-start');
      expect(screen.getByTestId('start-region').className).not.toBe(
        screen.getByTestId('end-region').className,
      );
    });

    it('keeps auto-height panel dividers on the stretching panel box', async () => {
      render(
        <Layout
          start={
            <LayoutPanel
              height="auto"
              hasDivider
              data-testid="auto-start-panel">
              Navigation
            </LayoutPanel>
          }
          content={<LayoutContent height="auto">Body</LayoutContent>}
          end={
            <LayoutPanel height="auto" hasDivider data-testid="auto-end-panel">
              Details
            </LayoutPanel>
          }
        />,
      );

      expect(await screen.findByRole('group')).toBeInTheDocument();
      const startPanel = screen.getByTestId('auto-start-panel');
      const endPanel = screen.getByTestId('auto-end-panel');

      expect(getComputedStyle(startPanel).borderInlineEndWidth).toBe('1px');
      expect(getComputedStyle(endPanel).borderInlineStartWidth).toBe('1px');
      expect(getComputedStyle(startPanel).alignSelf).not.toBe('flex-start');
      expect(getComputedStyle(endPanel).alignSelf).not.toBe('flex-start');
    });

    it('keeps auto-height dividers in page-owned layouts', () => {
      render(
        <Layout
          height="auto"
          start={
            <LayoutPanel height="auto" hasDivider data-testid="page-panel">
              Navigation
            </LayoutPanel>
          }
          content={<LayoutContent height="auto">Body</LayoutContent>}
        />,
      );

      expect(
        getComputedStyle(screen.getByTestId('page-panel')).borderInlineEndWidth,
      ).toBe('1px');
    });

    it('keeps each divider on its panel in multi-panel slots', async () => {
      render(
        <Layout
          start={
            <>
              <LayoutPanel height="auto" hasDivider data-testid="first-panel">
                First
              </LayoutPanel>
              <span data-testid="resize-handle" />
              <LayoutPanel height="auto" hasDivider data-testid="second-panel">
                Second
              </LayoutPanel>
            </>
          }
          content={<LayoutContent height="auto">Body</LayoutContent>}
        />,
      );

      expect(await screen.findByRole('group')).toBeInTheDocument();
      expect(
        getComputedStyle(screen.getByTestId('first-panel'))
          .borderInlineEndWidth,
      ).toBe('1px');
      expect(
        getComputedStyle(screen.getByTestId('second-panel'))
          .borderInlineEndWidth,
      ).toBe('1px');
      expect(screen.getByTestId('resize-handle')).toBeInTheDocument();
    });

    it('keeps fill-height panel dividers on the panel itself', () => {
      render(
        <Layout
          start={
            <LayoutPanel hasDivider data-testid="fill-panel">
              Navigation
            </LayoutPanel>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );

      const panel = screen.getByTestId('fill-panel');
      expect(getComputedStyle(panel).borderInlineEndWidth).toBe('1px');
      expect(panel.parentElement).not.toHaveAttribute(
        'data-layout-divider-end',
      );
    });

    it('pins a panel rendered beside a sibling in the same slot', async () => {
      render(
        <Layout
          start={
            <>
              <LayoutPanel data-testid="fragment-panel">Navigation</LayoutPanel>
              <span data-testid="resize-handle" />
            </>
          }
          content={<LayoutContent height="auto">Body</LayoutContent>}
        />,
      );

      expect(await screen.findByRole('group')).toBeInTheDocument();
      await waitFor(() =>
        expect(
          getComputedStyle(screen.getByTestId('fragment-panel').parentElement!)
            .position,
        ).toBe('sticky'),
      );
      expect(screen.getByTestId('resize-handle')).toBeInTheDocument();
    });

    it('uses shared scrolling when every panel root uses natural height', async () => {
      render(
        <Layout
          start={
            <>
              <LayoutPanel height="auto" data-testid="shared-panel-a">
                Navigation
              </LayoutPanel>
              <span data-testid="shared-resize-handle" />
              <LayoutPanel height="auto" data-testid="shared-panel-b">
                Filters
              </LayoutPanel>
            </>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );

      expect(await screen.findByRole('group')).toBeInTheDocument();
      expect(screen.getByTestId('shared-panel-a')).toHaveAttribute(
        'data-layout-scroll-state',
        'middle',
      );
      expect(screen.getByTestId('shared-panel-b')).toHaveAttribute(
        'data-layout-scroll-state',
        'middle',
      );
      expect(
        getComputedStyle(
          screen.getByTestId('shared-resize-handle').parentElement!,
        ).display,
      ).toBe('flex');
    });

    it('keeps a slot pinned when its panel roots use mixed heights', async () => {
      const {rerender} = render(
        <Layout
          start={
            <>
              <LayoutPanel data-testid="self-panel">Navigation</LayoutPanel>
              <LayoutPanel height="auto" data-testid="shared-panel">
                Filters
              </LayoutPanel>
            </>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );

      await waitFor(() =>
        expect(screen.queryByRole('group')).not.toBeInTheDocument(),
      );
      expect(screen.getByTestId('self-panel')).not.toHaveAttribute(
        'data-layout-scroll-state',
      );
      expect(screen.getByTestId('shared-panel')).not.toHaveAttribute(
        'data-layout-scroll-state',
      );
      expect(
        getComputedStyle(screen.getByTestId('shared-panel')).overflow,
      ).toBe('auto');

      rerender(
        <Layout
          start={
            <>
              <LayoutPanel height="auto" data-testid="shared-panel">
                Filters
              </LayoutPanel>
              <LayoutPanel data-testid="self-panel">Navigation</LayoutPanel>
            </>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );

      await waitFor(() =>
        expect(screen.queryByRole('group')).not.toBeInTheDocument(),
      );
    });

    it('pins arbitrary side-slot content when another region uses middle scrolling', async () => {
      render(
        <Layout
          start={<span data-testid="arbitrary-start">Utility</span>}
          content={<LayoutContent height="auto">Body</LayoutContent>}
        />,
      );

      expect(await screen.findByRole('group')).toBeInTheDocument();
      expect(
        getComputedStyle(screen.getByTestId('arbitrary-start').parentElement!)
          .position,
      ).toBe('sticky');
      expect(
        getComputedStyle(screen.getByTestId('arbitrary-start').parentElement!)
          .overflow,
      ).toBe('auto');
    });

    it('keeps arbitrary content independently scrollable beside a shared region', async () => {
      render(
        <Layout
          start={<LayoutPanel height="auto">Navigation</LayoutPanel>}
          content={<div data-testid="arbitrary-content">Tall content</div>}
        />,
      );

      expect(await screen.findByRole('group')).toBeInTheDocument();
      const contentLane =
        screen.getByTestId('arbitrary-content').parentElement!;
      expect(getComputedStyle(contentLane).position).toBe('sticky');
      expect(getComputedStyle(contentLane).overflow).toBe('auto');
    });

    it('aligns header and footer without clipping their overflow', () => {
      render(
        <Layout
          contentWidth={640}
          header={<LayoutHeader data-testid="header">Header</LayoutHeader>}
          content={
            <LayoutContent height="auto" data-testid="content-region">
              Body
            </LayoutContent>
          }
          footer={<LayoutFooter data-testid="footer">Footer</LayoutFooter>}
        />,
      );

      const middle = screen.getByRole('group');
      expect(getComputedStyle(middle).scrollbarGutter).toBe(
        'stable both-edges',
      );
      expect(getComputedStyle(screen.getByTestId('header')).overflowY).not.toBe(
        'hidden',
      );
      expect(getComputedStyle(screen.getByTestId('footer')).overflowY).not.toBe(
        'hidden',
      );
      expect(
        middle.parentElement?.style.getPropertyValue(
          '--layout-scroll-gutter-inline',
        ),
      ).toBe('0px');
    });

    it('recomputes aligned bar gutters when contentWidth changes', async () => {
      const {rerender} = render(
        <Layout
          contentWidth="fit-content"
          header={<LayoutHeader data-testid="header">Header</LayoutHeader>}
          content={<LayoutContent height="auto">Body</LayoutContent>}
          footer={<LayoutFooter data-testid="footer">Footer</LayoutFooter>}
        />,
      );
      expect(screen.getByTestId('header')).toHaveAttribute(
        'data-layout-scroll-state',
        'aligned',
      );
      expect(screen.getByTestId('footer')).toHaveAttribute(
        'data-layout-scroll-state',
        'aligned',
      );
      expect(
        screen
          .getByTestId('header')
          .style.getPropertyValue('--layout-aligned-content-width'),
      ).toBe('0px');

      rerender(
        <Layout
          contentWidth={640}
          header={<LayoutHeader data-testid="header">Header</LayoutHeader>}
          content={<LayoutContent height="auto">Body</LayoutContent>}
          footer={<LayoutFooter data-testid="footer">Footer</LayoutFooter>}
        />,
      );

      await waitFor(() =>
        expect(
          screen
            .getByTestId('header')
            .style.getPropertyValue('--layout-aligned-content-width'),
        ).toBe(''),
      );
      expect(screen.getByTestId('footer')).toHaveAttribute(
        'data-layout-scroll-state',
        'aligned',
      );
    });

    it('detects a slot that resolves to a region root through a wrapper', async () => {
      render(<Layout content={<WrappedContent />} />);

      expect(await screen.findByRole('group')).toBeInTheDocument();
      expect(screen.getByTestId('wrapped-content')).toHaveAttribute(
        'data-layout-scroll-state',
        'middle',
      );
    });

    it('tracks a transparent child whose top-level region root changes', async () => {
      render(<Layout content={<SwitchingContent />} />);

      expect(screen.queryByRole('group')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', {name: 'Use region root'}));
      expect(await screen.findByRole('group')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', {name: 'Reset root'}));
      await waitFor(() =>
        expect(screen.queryByRole('group')).not.toBeInTheDocument(),
      );
    });

    it('does not leak direct ownership into nested regions', () => {
      render(
        <Layout
          start={
            <LayoutPanel height="auto">
              <LayoutPanel data-testid="nested-panel">Nested</LayoutPanel>
            </LayoutPanel>
          }
          content={<NestedContent />}
        />,
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByTestId('nested-content')).not.toHaveAttribute(
        'data-layout-scroll-state',
      );
      expect(screen.getByTestId('nested-panel')).not.toHaveAttribute(
        'data-layout-scroll-state',
      );
    });

    it('does not apply aligned scrollbar gutters to headers nested under arbitrary content', () => {
      render(
        <Layout
          start={<LayoutPanel height="auto">Panel</LayoutPanel>}
          content={
            <div>
              <LayoutHeader data-testid="nested-header">Nested</LayoutHeader>
            </div>
          }
        />,
      );

      expect(
        getComputedStyle(screen.getByTestId('nested-header')).scrollbarGutter,
      ).not.toBe('stable both-edges');
    });

    it('does not apply aligned gutters to nested bars in header/footer slots', () => {
      render(
        <Layout
          header={
            <div>
              <LayoutHeader data-testid="wrapped-header">Header</LayoutHeader>
            </div>
          }
          content={<LayoutContent height="auto">Content</LayoutContent>}
          footer={
            <div>
              <LayoutFooter data-testid="wrapped-footer">Footer</LayoutFooter>
            </div>
          }
        />,
      );

      expect(
        getComputedStyle(screen.getByTestId('wrapped-header'))
          .paddingInlineStart,
      ).not.toContain('--layout-scroll-gutter-inline');
      expect(
        getComputedStyle(screen.getByTestId('wrapped-footer'))
          .paddingInlineStart,
      ).not.toContain('--layout-scroll-gutter-inline');
    });

    it('preserves natural panel height when Layout scrolling is page-owned', () => {
      render(
        <Layout
          height="auto"
          start={
            <LayoutPanel height="auto" data-testid="auto-panel">
              Panel
            </LayoutPanel>
          }
          content={<LayoutContent height="auto">Content</LayoutContent>}
        />,
      );

      expect(
        getComputedStyle(screen.getByTestId('auto-panel')).alignSelf,
      ).not.toBe('flex-start');
    });

    it('clears fill-only ownership when height changes to auto', async () => {
      const {rerender} = render(
        <Layout
          height="fill"
          start={
            <LayoutPanel data-testid="transition-panel">Panel</LayoutPanel>
          }
          content={<LayoutContent height="auto">Content</LayoutContent>}
        />,
      );

      await waitFor(() =>
        expect(
          getComputedStyle(
            screen.getByTestId('transition-panel').parentElement!,
          ).position,
        ).toBe('sticky'),
      );

      rerender(
        <Layout
          height="auto"
          start={
            <LayoutPanel data-testid="transition-panel">Panel</LayoutPanel>
          }
          content={<LayoutContent height="auto">Content</LayoutContent>}
        />,
      );

      await waitFor(() =>
        expect(
          getComputedStyle(
            screen.getByTestId('transition-panel').parentElement!,
          ).position,
        ).not.toBe('sticky'),
      );
      expect(screen.getByText('Content')).not.toHaveAttribute(
        'data-layout-scroll-state',
      );
    });

    it('does not clear ownership state from a nested Layout', async () => {
      render(
        <Layout
          content={
            <LayoutContent height="auto" data-testid="outer-content">
              <Layout
                content={
                  <LayoutContent height="auto" data-testid="inner-content">
                    Inner
                  </LayoutContent>
                }
              />
            </LayoutContent>
          }
        />,
      );

      await waitFor(() => {
        expect(screen.getByTestId('outer-content')).toHaveAttribute(
          'data-layout-scroll-state',
          'middle',
        );
        expect(screen.getByTestId('inner-content')).toHaveAttribute(
          'data-layout-scroll-state',
          'middle',
        );
      });
    });

    it('shadows measured height inside nested constrained layouts', async () => {
      const {container} = render(
        <Layout
          contentWidth={640}
          content={
            <LayoutContent height="auto">
              <Layout
                contentWidth="fit-content"
                content={<LayoutContent height="auto">Inner</LayoutContent>}
              />
            </LayoutContent>
          }
        />,
      );

      await waitFor(() => {
        const layoutInners = container.querySelectorAll('.astryx-layout > div');
        expect(
          (
            layoutInners.item(layoutInners.length - 1) as HTMLElement
          ).style.getPropertyValue('--layout-middle-client-height'),
        ).toBe('100%');
      });
    });

    it('does not treat arbitrary component height props as region ownership', () => {
      render(<Layout content={<Widget height="auto" />} />);

      const middleRow =
        screen.getByTestId('widget').parentElement!.parentElement!;
      expect(middleRow).not.toHaveAttribute('role');
      expect(middleRow).not.toHaveAttribute('tabindex');
    });

    it('keeps arbitrary single-column content constrained', () => {
      render(<Layout contentWidth={640} content={<div>Body</div>} />);
      const middleRow = screen.getByText('Body').parentElement!.parentElement!;
      expect(middleRow).not.toHaveAttribute('role');
    });

    it('does not crash when contentWidth is not set', () => {
      render(
        <Layout
          content={
            <LayoutContent>
              <span data-testid="body">Body</span>
            </LayoutContent>
          }
        />,
      );
      expect(screen.getByTestId('body')).toBeInTheDocument();
    });
  });

  describe('LayoutHeader', () => {
    it('always renders contentWidth inner wrapper', () => {
      render(
        <Layout
          header={
            <LayoutHeader>
              <span data-testid="header-child">Header</span>
            </LayoutHeader>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );
      const headerChild = screen.getByTestId('header-child');
      const innerWrapper = headerChild.parentElement!;
      const headerDiv = innerWrapper.parentElement!;
      expect(headerDiv.className).toContain('astryx-layout-header');
      expect(innerWrapper).not.toBe(headerDiv);
    });

    it('keeps divider on outer element', () => {
      render(
        <Layout
          contentWidth={640}
          defaultHasDividers
          header={
            <LayoutHeader>
              <span data-testid="header-child">Header</span>
            </LayoutHeader>
          }
          content={<LayoutContent>Body</LayoutContent>}
        />,
      );
      const headerChild = screen.getByTestId('header-child');
      const innerWrapper = headerChild.parentElement!;
      const headerDiv = innerWrapper.parentElement!;
      expect(headerDiv).toHaveAttribute('data-divider');
      expect(innerWrapper).not.toHaveAttribute('data-divider');
    });
  });

  describe('LayoutFooter', () => {
    it('always renders contentWidth inner wrapper', () => {
      render(
        <Layout
          content={<LayoutContent>Body</LayoutContent>}
          footer={
            <LayoutFooter>
              <span data-testid="footer-child">Footer</span>
            </LayoutFooter>
          }
        />,
      );
      const footerChild = screen.getByTestId('footer-child');
      const innerWrapper = footerChild.parentElement!;
      const footerDiv = innerWrapper.parentElement!;
      expect(footerDiv.className).toContain('astryx-layout-footer');
      expect(innerWrapper).not.toBe(footerDiv);
    });

    it('keeps divider on outer element', () => {
      render(
        <Layout
          contentWidth={640}
          defaultHasDividers
          content={<LayoutContent>Body</LayoutContent>}
          footer={
            <LayoutFooter>
              <span data-testid="footer-child">Footer</span>
            </LayoutFooter>
          }
        />,
      );
      const footerChild = screen.getByTestId('footer-child');
      const innerWrapper = footerChild.parentElement!;
      const footerDiv = innerWrapper.parentElement!;
      expect(footerDiv).toHaveAttribute('data-divider');
      expect(innerWrapper).not.toHaveAttribute('data-divider');
    });
  });
});
