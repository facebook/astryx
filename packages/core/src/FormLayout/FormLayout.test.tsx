// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FormLayout.test.tsx
 * @input Uses vitest, @testing-library/react, FormLayout component
 * @output Unit tests for FormLayout component behavior
 * @position Testing; validates FormLayout.tsx implementation
 *
 * SYNC: When FormLayout.tsx changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {use} from 'react';
import {FormLayout} from './FormLayout';
import {FormLayoutContext} from './FormLayoutContext';
import type {FormLayoutDirection} from './FormLayoutContext';
import {Field} from '../Field';

// Helper component to read context
function DirectionReader() {
  const {direction} = use(FormLayoutContext);
  return <span data-testid="direction">{direction}</span>;
}

describe('FormLayout', () => {
  // ─── Basic rendering ────────────────────────────────────────────────────

  it('renders children', () => {
    render(
      <FormLayout>
        <input data-testid="child" />
      </FormLayout>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders a div element', () => {
    render(<FormLayout data-testid="layout">content</FormLayout>);
    const el = screen.getByTestId('layout');
    expect(el.tagName).toBe('DIV');
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<FormLayout ref={ref}>content</FormLayout>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(<FormLayout data-testid="my-form">content</FormLayout>);
    expect(screen.getByTestId('my-form')).toBeInTheDocument();
  });

  it('passes through HTML attributes', () => {
    render(
      <FormLayout data-testid="layout" id="form-1" role="group">
        content
      </FormLayout>,
    );
    const el = screen.getByTestId('layout');
    expect(el).toHaveAttribute('id', 'form-1');
    expect(el).toHaveAttribute('role', 'group');
  });

  // ─── Direction modes ────────────────────────────────────────────────────

  it('defaults to vertical direction', () => {
    render(
      <FormLayout data-testid="layout">
        <DirectionReader />
      </FormLayout>,
    );
    expect(screen.getByTestId('direction')).toHaveTextContent('vertical');
  });

  it('supports horizontal direction', () => {
    render(
      <FormLayout direction="horizontal" data-testid="layout">
        <DirectionReader />
      </FormLayout>,
    );
    expect(screen.getByTestId('direction')).toHaveTextContent('horizontal');
  });

  it('supports horizontal-labels direction', () => {
    render(
      <FormLayout direction="horizontal-labels" data-testid="layout">
        <DirectionReader />
      </FormLayout>,
    );
    expect(screen.getByTestId('direction')).toHaveTextContent(
      'horizontal-labels',
    );
  });

  // ─── Context propagation ────────────────────────────────────────────────

  it('provides direction context to children', () => {
    const directions: FormLayoutDirection[] = [
      'vertical',
      'horizontal',
      'horizontal-labels',
    ];

    for (const dir of directions) {
      const {unmount} = render(
        <FormLayout direction={dir}>
          <DirectionReader />
        </FormLayout>,
      );
      expect(screen.getByTestId('direction')).toHaveTextContent(dir);
      unmount();
    }
  });

  it('provides default context when no direction is specified', () => {
    render(
      <FormLayout>
        <DirectionReader />
      </FormLayout>,
    );
    expect(screen.getByTestId('direction')).toHaveTextContent('vertical');
  });

  // ─── Nesting ────────────────────────────────────────────────────────────

  it('supports nesting — inner layout overrides context', () => {
    render(
      <FormLayout direction="vertical" data-testid="outer">
        <FormLayout direction="horizontal" data-testid="inner">
          <DirectionReader />
        </FormLayout>
      </FormLayout>,
    );
    // Inner context should be 'horizontal', not 'vertical'
    expect(screen.getByTestId('direction')).toHaveTextContent('horizontal');
  });

  it('renders nested layouts with different elements', () => {
    render(
      <FormLayout data-testid="outer">
        <input data-testid="outer-child" />
        <FormLayout direction="horizontal" data-testid="inner">
          <input data-testid="inner-child-1" />
          <input data-testid="inner-child-2" />
        </FormLayout>
      </FormLayout>,
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
      <FormLayout data-testid="layout">
        <input placeholder="Name" />
        <input placeholder="Email" />
      </FormLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for horizontal direction', () => {
    const {container} = render(
      <FormLayout direction="horizontal" data-testid="layout">
        <input placeholder="First" />
        <input placeholder="Last" />
      </FormLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for horizontal-labels direction', () => {
    const {container} = render(
      <FormLayout direction="horizontal-labels" data-testid="layout">
        <label>Name</label>
        <input placeholder="Name" />
      </FormLayout>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  // ─── Horizontal-labels with real Field children ─────────────────────────

  it('horizontal-labels renders Field children with display:contents', () => {
    render(
      <FormLayout direction="horizontal-labels" data-testid="layout">
        <Field label="Name" inputID="name">
          <input id="name" data-testid="name-input" />
        </Field>
        <Field label="Email" inputID="email">
          <input id="email" data-testid="email-input" />
        </Field>
      </FormLayout>,
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

  it('horizontal-labels with Field: label and input wrapper are siblings under display:contents', () => {
    render(
      <FormLayout direction="horizontal-labels" data-testid="layout">
        <Field
          label="Username"
          inputID="username"
          data-testid="username-field">
          <input id="username" data-testid="username-input" />
        </Field>
      </FormLayout>,
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
