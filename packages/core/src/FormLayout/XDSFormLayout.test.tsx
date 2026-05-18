// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import {XDSFormLayout} from './XDSFormLayout';
import {XDSFormLayoutContext} from './XDSFormLayoutContext';
import type {XDSFormLayoutDirection} from './XDSFormLayoutContext';
import {XDSField} from '../Field';

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

  // ─── Horizontal-labels with real Field children ─────────────────────────

  it('horizontal-labels renders XDSField children with display:contents', () => {
    render(
      <XDSFormLayout direction="horizontal-labels" data-testid="layout">
        <XDSField label="Name" inputID="name">
          <input id="name" data-testid="name-input" />
        </XDSField>
        <XDSField label="Email" inputID="email">
          <input id="email" data-testid="email-input" />
        </XDSField>
      </XDSFormLayout>,
    );

    const layout = screen.getByTestId('layout');

    // Labels should be accessible
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();

    // The label and input wrapper should be direct grid-participating children
    // (via display:contents on the Field wrapper)
    const nameLabel = screen.getByText('Name');
    const emailLabel = screen.getByText('Email');
    expect(nameLabel.tagName).toBe('LABEL');
    expect(emailLabel.tagName).toBe('LABEL');

    // Both fields should be inside the layout
    expect(layout.contains(nameLabel)).toBe(true);
    expect(layout.contains(screen.getByTestId('name-input'))).toBe(true);
    expect(layout.contains(emailLabel)).toBe(true);
    expect(layout.contains(screen.getByTestId('email-input'))).toBe(true);
  });

  it('horizontal-labels with XDSField: label and input wrapper are siblings under display:contents', () => {
    render(
      <XDSFormLayout direction="horizontal-labels" data-testid="layout">
        <XDSField
          label="Username"
          inputID="username"
          data-testid="username-field">
          <input id="username" data-testid="username-input" />
        </XDSField>
      </XDSFormLayout>,
    );

    const field = screen.getByTestId('username-field');
    // Field should have display:contents class
    expect(field.className).toContain('horizontalLabels');

    // Field's direct children should be: label alignment div + input wrapper div
    const fieldChildren = Array.from(field.children);
    expect(fieldChildren.length).toBe(2);
    // First child is the label alignment wrapper containing the <label>
    expect(fieldChildren[0].tagName).toBe('DIV');
    expect(fieldChildren[0].querySelector('label')).not.toBeNull();
    // Second child is the input wrapper div
    expect(fieldChildren[1].tagName).toBe('DIV');
    // The input should be inside the wrapper div (column 2)
    expect(
      fieldChildren[1].contains(screen.getByTestId('username-input')),
    ).toBe(true);
  });
});
