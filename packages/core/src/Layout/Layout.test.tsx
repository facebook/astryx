// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Layout.test.tsx
 * @input Uses vitest, @testing-library/react, Layout + layout contexts
 * @output Characterization tests for the Layout page-shell component
 * @position Testing; validates slot rendering, context provisioning, and
 *   divider/padding/height wiring
 *
 * SYNC: When Layout.tsx changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {use, createRef} from 'react';
import {Layout} from './Layout';
import {LayoutHeader} from './LayoutHeader';
import {LayoutFooter} from './LayoutFooter';
import {LayoutAreaContext} from './LayoutAreaContext';
import {LayoutSlotsContext} from './LayoutSlotsContext';

/** Reports which layout area it is rendered inside. */
function AreaProbe({testid}: {testid: string}) {
  const area = use(LayoutAreaContext);
  return <span data-testid={testid}>{String(area)}</span>;
}

/** Reports the current LayoutSlots record as JSON. */
function SlotsProbe() {
  const slots = use(LayoutSlotsContext);
  return <span data-testid="slots">{JSON.stringify(slots)}</span>;
}

/** The Layout root is the outermost element rendered by the component. */
function root(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

describe('Layout', () => {
  describe('content / children resolution', () => {
    it('renders the content prop', () => {
      render(<Layout content={<div>main body</div>} />);
      expect(screen.getByText('main body')).toBeInTheDocument();
    });

    it('renders children as a shorthand for the content slot', () => {
      render(
        <Layout>
          <div>child body</div>
        </Layout>,
      );
      expect(screen.getByText('child body')).toBeInTheDocument();
    });

    it('content wins when both content and children are provided', () => {
      render(
        <Layout content={<div>from-content</div>}>
          <div>from-children</div>
        </Layout>,
      );
      expect(screen.getByText('from-content')).toBeInTheDocument();
      expect(screen.queryByText('from-children')).not.toBeInTheDocument();
    });

    it('renders an empty shell without crashing when no slots are given', () => {
      const {container} = render(<Layout />);
      expect(root(container)).toBeInTheDocument();
    });
  });

  describe('slots', () => {
    it('renders all four surrounding slots plus content', () => {
      render(
        <Layout
          header={<div>the-header</div>}
          start={<div>the-start</div>}
          end={<div>the-end</div>}
          footer={<div>the-footer</div>}
          content={<div>the-content</div>}
        />,
      );
      expect(screen.getByText('the-header')).toBeInTheDocument();
      expect(screen.getByText('the-start')).toBeInTheDocument();
      expect(screen.getByText('the-end')).toBeInTheDocument();
      expect(screen.getByText('the-footer')).toBeInTheDocument();
      expect(screen.getByText('the-content')).toBeInTheDocument();
    });

    it('does not render an area wrapper for an omitted slot', () => {
      render(<Layout content={<AreaProbe testid="content" />} />);
      // Only the content probe exists; header/start/end/footer probes absent.
      expect(screen.getByTestId('content')).toHaveTextContent('content');
    });
  });

  describe('LayoutAreaContext provisioning', () => {
    it('tags each slot with its area name', () => {
      render(
        <Layout
          header={<AreaProbe testid="h" />}
          start={<AreaProbe testid="s" />}
          end={<AreaProbe testid="e" />}
          footer={<AreaProbe testid="f" />}
          content={<AreaProbe testid="c" />}
        />,
      );
      expect(screen.getByTestId('h')).toHaveTextContent('header');
      expect(screen.getByTestId('s')).toHaveTextContent('start');
      expect(screen.getByTestId('e')).toHaveTextContent('end');
      expect(screen.getByTestId('f')).toHaveTextContent('footer');
      expect(screen.getByTestId('c')).toHaveTextContent('content');
    });
  });

  describe('LayoutSlotsContext provisioning', () => {
    it('reports which slots are filled to descendants', () => {
      render(
        <Layout
          header={<div>h</div>}
          start={<div>s</div>}
          content={<SlotsProbe />}
        />,
      );
      const slots = JSON.parse(screen.getByTestId('slots').textContent ?? '{}');
      expect(slots).toEqual({
        hasHeader: true,
        hasFooter: false,
        hasStart: true,
        hasEnd: false,
      });
    });

    it('reports all-false when only content is present', () => {
      render(<Layout content={<SlotsProbe />} />);
      const slots = JSON.parse(screen.getByTestId('slots').textContent ?? '{}');
      expect(slots).toEqual({
        hasHeader: false,
        hasFooter: false,
        hasStart: false,
        hasEnd: false,
      });
    });

    it('reports every slot filled', () => {
      render(
        <Layout
          header={<div>h</div>}
          footer={<div>f</div>}
          start={<div>s</div>}
          end={<div>e</div>}
          content={<SlotsProbe />}
        />,
      );
      const slots = JSON.parse(screen.getByTestId('slots').textContent ?? '{}');
      expect(slots).toEqual({
        hasHeader: true,
        hasFooter: true,
        hasStart: true,
        hasEnd: true,
      });
    });
  });

  describe('theme props (class + data attributes)', () => {
    it('renders the astryx-layout class on the root', () => {
      const {container} = render(<Layout content={<div>x</div>} />);
      expect(root(container).className).toContain('astryx-layout');
    });

    it('defaults data-height to "fill"', () => {
      const {container} = render(<Layout content={<div>x</div>} />);
      expect(root(container).getAttribute('data-height')).toBe('fill');
    });

    it('reflects height="auto" as data-height', () => {
      const {container} = render(
        <Layout height="auto" content={<div>x</div>} />,
      );
      expect(root(container).getAttribute('data-height')).toBe('auto');
    });
  });

  describe('defaultHasDividers → LayoutDividerContext', () => {
    it('makes headers default to having a divider', () => {
      render(
        <Layout
          defaultHasDividers
          header={<LayoutHeader>H</LayoutHeader>}
          content={<div>c</div>}
        />,
      );
      const header = screen.getByText('H').closest('[data-divider]');
      expect(header).not.toBeNull();
      expect(header?.getAttribute('data-divider')).toBe('true');
    });

    it('makes footers default to having a divider', () => {
      const {container} = render(
        <Layout
          defaultHasDividers
          footer={<LayoutFooter>F</LayoutFooter>}
          content={<div>c</div>}
        />,
      );
      expect(
        container.querySelector('.astryx-layout-footer[data-divider]'),
      ).not.toBeNull();
    });

    it('does not force dividers when defaultHasDividers is unset', () => {
      const {container} = render(
        <Layout
          header={<LayoutHeader>H</LayoutHeader>}
          content={<div>c</div>}
        />,
      );
      expect(
        container.querySelector('.astryx-layout-header[data-divider]'),
      ).toBeNull();
    });

    it('an explicit hasDivider={false} on a header overrides the context default', () => {
      const {container} = render(
        <Layout
          defaultHasDividers
          header={<LayoutHeader hasDivider={false}>H</LayoutHeader>}
          content={<div>c</div>}
        />,
      );
      expect(
        container.querySelector('.astryx-layout-header[data-divider]'),
      ).toBeNull();
    });
  });

  describe('padding / contentWidth', () => {
    it('accepts a numeric padding step without crashing', () => {
      const {container} = render(<Layout padding={4} content={<div>c</div>} />);
      expect(root(container)).toBeInTheDocument();
    });

    it('accepts padding={0} (full bleed) without crashing', () => {
      const {container} = render(<Layout padding={0} content={<div>c</div>} />);
      expect(root(container)).toBeInTheDocument();
    });

    it('accepts a numeric contentWidth without crashing', () => {
      const {container} = render(
        <Layout contentWidth={640} content={<div>c</div>} />,
      );
      expect(root(container)).toBeInTheDocument();
    });

    it('accepts a string contentWidth without crashing', () => {
      const {container} = render(
        <Layout contentWidth="60ch" content={<div>c</div>} />,
      );
      expect(root(container)).toBeInTheDocument();
    });
  });

  describe('styling & ref', () => {
    it('forwards ref to the root div', () => {
      const ref = createRef<HTMLDivElement>();
      render(<Layout ref={ref} content={<div>c</div>} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain('astryx-layout');
    });

    it('merges a caller className onto the root', () => {
      const {container} = render(
        <Layout className="my-layout" content={<div>c</div>} />,
      );
      expect(root(container).className).toContain('my-layout');
      expect(root(container).className).toContain('astryx-layout');
    });

    it('merges a caller inline style onto the root', () => {
      const {container} = render(
        <Layout style={{outline: '1px solid red'}} content={<div>c</div>} />,
      );
      expect(root(container).style.outline).toBe('1px solid red');
    });
  });
});
