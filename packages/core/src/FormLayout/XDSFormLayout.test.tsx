/**
 * @file XDSFormLayout.test.tsx
 * @input Uses vitest, @testing-library/react, XDSFormLayout component
 * @output Unit tests for XDSFormLayout component behavior
 * @position Testing; validates XDSFormLayout.tsx implementation
 *
 * SYNC: When XDSFormLayout.tsx changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {useContext} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSFormLayout} from './XDSFormLayout';
import {XDSFormLayoutContext} from './XDSFormLayoutContext';
import type {XDSFormLayoutDirection} from './XDSFormLayoutContext';

// Helper component to read context
function DirectionReader() {
  const {direction} = useContext(XDSFormLayoutContext);
  return <span data-testid="direction">{direction}</span>;
}

describe('XDSFormLayout', () => {
  // ─── Basic rendering ────────────────────────────────────────────────────

  it('renders children', () => {
    render(
      <XDSFormLayout>
        <input data-testid="child" />
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders a div element', () => {
    render(<XDSFormLayout data-testid="layout">content</XDSFormLayout>);
    const el = screen.getByTestId('layout');
    expect(el.tagName).toBe('DIV');
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSFormLayout ref={ref}>content</XDSFormLayout>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(<XDSFormLayout data-testid="my-form">content</XDSFormLayout>);
    expect(screen.getByTestId('my-form')).toBeInTheDocument();
  });

  it('passes through HTML attributes', () => {
    render(
      <XDSFormLayout data-testid="layout" id="form-1" role="group">
        content
      </XDSFormLayout>,
    );
    const el = screen.getByTestId('layout');
    expect(el).toHaveAttribute('id', 'form-1');
    expect(el).toHaveAttribute('role', 'group');
  });

  // ─── Direction modes ────────────────────────────────────────────────────

  it('defaults to vertical direction', () => {
    render(
      <XDSFormLayout data-testid="layout">
        <DirectionReader />
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('direction')).toHaveTextContent('vertical');
  });

  it('supports horizontal direction', () => {
    render(
      <XDSFormLayout direction="horizontal" data-testid="layout">
        <DirectionReader />
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('direction')).toHaveTextContent('horizontal');
  });

  it('supports horizontal-labels direction', () => {
    render(
      <XDSFormLayout direction="horizontal-labels" data-testid="layout">
        <DirectionReader />
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('direction')).toHaveTextContent(
      'horizontal-labels',
    );
  });

  // ─── Context propagation ────────────────────────────────────────────────

  it('provides direction context to children', () => {
    const directions: XDSFormLayoutDirection[] = [
      'vertical',
      'horizontal',
      'horizontal-labels',
    ];

    for (const dir of directions) {
      const {unmount} = render(
        <XDSFormLayout direction={dir}>
          <DirectionReader />
        </XDSFormLayout>,
      );
      expect(screen.getByTestId('direction')).toHaveTextContent(dir);
      unmount();
    }
  });

  it('provides default context when no direction is specified', () => {
    render(
      <XDSFormLayout>
        <DirectionReader />
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('direction')).toHaveTextContent('vertical');
  });

  // ─── Nesting ────────────────────────────────────────────────────────────

  it('supports nesting — inner layout overrides context', () => {
    render(
      <XDSFormLayout direction="vertical" data-testid="outer">
        <XDSFormLayout direction="horizontal" data-testid="inner">
          <DirectionReader />
        </XDSFormLayout>
      </XDSFormLayout>,
    );
    // Inner context should be 'horizontal', not 'vertical'
    expect(screen.getByTestId('direction')).toHaveTextContent('horizontal');
  });

  it('renders nested layouts with different elements', () => {
    render(
      <XDSFormLayout data-testid="outer">
        <input data-testid="outer-child" />
        <XDSFormLayout direction="horizontal" data-testid="inner">
          <input data-testid="inner-child-1" />
          <input data-testid="inner-child-2" />
        </XDSFormLayout>
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('outer')).toBeInTheDocument();
    expect(screen.getByTestId('inner')).toBeInTheDocument();
    expect(screen.getByTestId('outer-child')).toBeInTheDocument();
    expect(screen.getByTestId('inner-child-1')).toBeInTheDocument();
    expect(screen.getByTestId('inner-child-2')).toBeInTheDocument();
  });

  // ─── Styling props ─────────────────────────────────────────────────────

  it('applies xstyle to the root element', () => {
    const overrides = stylex.create({root: {marginBottom: '8px'}});
    const {container} = render(
      <XDSFormLayout data-testid="layout" xstyle={overrides.root}>
        content
      </XDSFormLayout>,
    );
    // StyleX compiles to class names; verify the xstyle class is present
    // by checking we get more classes than a bare layout
    const {container: bare} = render(
      <XDSFormLayout data-testid="bare">content</XDSFormLayout>,
    );
    const styledClasses = container.firstElementChild!.className.split(' ');
    const bareClasses = bare.firstElementChild!.className.split(' ');
    expect(styledClasses.length).toBeGreaterThan(bareClasses.length);
  });

  it('applies className to the root element', () => {
    render(
      <XDSFormLayout data-testid="layout" className="custom-class">
        content
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('layout').className).toContain('custom-class');
  });

  it('applies inline style to the root element', () => {
    render(
      <XDSFormLayout data-testid="layout" style={{padding: '16px'}}>
        content
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('layout').style.padding).toBe('16px');
  });

  // ─── Edge cases ───────────────────────────────────────────────────────

  it('renders without children', () => {
    render(<XDSFormLayout data-testid="layout" />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('layout').childElementCount).toBe(0);
  });

  // ─── Component metadata ───────────────────────────────────────────────

  it('has displayName', () => {
    expect(XDSFormLayout.displayName).toBe('XDSFormLayout');
  });

  // ─── Context-based label alignment ─────────────────────────────────────

  it('children can use context to determine label alignment', () => {
    // Simulates a child component that reads direction context to decide
    // whether labels should be placed beside inputs (horizontal-labels)
    // or above them (vertical/horizontal).
    function LabelAlignmentReader() {
      const {direction} = useContext(XDSFormLayoutContext);
      const alignment = direction === 'horizontal-labels' ? 'beside' : 'above';
      return <span data-testid="alignment">{alignment}</span>;
    }

    const {rerender} = render(
      <XDSFormLayout direction="horizontal-labels">
        <LabelAlignmentReader />
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('alignment')).toHaveTextContent('beside');

    rerender(
      <XDSFormLayout direction="vertical">
        <LabelAlignmentReader />
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('alignment')).toHaveTextContent('above');

    rerender(
      <XDSFormLayout direction="horizontal">
        <LabelAlignmentReader />
      </XDSFormLayout>,
    );
    expect(screen.getByTestId('alignment')).toHaveTextContent('above');
  });

  // ─── Snapshot tests ─────────────────────────────────────────────────────

  it('matches snapshot for vertical direction', () => {
    const {container} = render(
      <XDSFormLayout data-testid="layout">
        <input placeholder="Name" />
        <input placeholder="Email" />
      </XDSFormLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for horizontal direction', () => {
    const {container} = render(
      <XDSFormLayout direction="horizontal" data-testid="layout">
        <input placeholder="First" />
        <input placeholder="Last" />
      </XDSFormLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for horizontal-labels direction', () => {
    const {container} = render(
      <XDSFormLayout direction="horizontal-labels" data-testid="layout">
        <label>Name</label>
        <input placeholder="Name" />
      </XDSFormLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
