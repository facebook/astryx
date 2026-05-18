// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSButtonGroup.test.tsx
 * @input Uses vitest, @testing-library/react, ButtonGroup and Button components
 * @output Unit tests for XDSButtonGroup
 * @position Testing; validates ButtonGroup component implementation
 *
 * SYNC: When ButtonGroup component changes, update tests to match new behavior
 */

import {createRef} from 'react';
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSButtonGroup} from './XDSButtonGroup';
import {XDSButton} from '../Button';
import {XDSIconButton} from '../IconButton';

describe('XDSButtonGroup', () => {
  it('renders a group with aria-label', () => {
    render(
      <XDSButtonGroup label="Actions">
        <XDSButton label="Copy" />
        <XDSButton label="Cut" />
        <XDSButton label="Paste" />
      </XDSButtonGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Actions');
  });

  it('renders all child buttons', () => {
    render(
      <XDSButtonGroup label="Actions">
        <XDSButton label="Copy" />
        <XDSButton label="Cut" />
        <XDSButton label="Paste" />
      </XDSButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Paste'})).toBeInTheDocument();
  });

  it('works with XDSIconButton children', () => {
    render(
      <XDSButtonGroup label="Text formatting">
        <XDSIconButton
          label="Bold"
          icon={<span data-testid="bold-icon">B</span>}
        />
        <XDSIconButton
          label="Italic"
          icon={<span data-testid="italic-icon">I</span>}
        />
      </XDSButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Bold'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Italic'})).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    render(
      <XDSButtonGroup label="Actions" data-testid="my-group">
        <XDSButton label="Copy" />
      </XDSButtonGroup>,
    );

    expect(screen.getByTestId('my-group')).toBeInTheDocument();
  });

  it('forwards ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <XDSButtonGroup label="Actions" ref={ref}>
        <XDSButton label="Copy" />
      </XDSButtonGroup>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByRole('group'));
  });

  it('sets aria-orientation', () => {
    const {rerender} = render(
      <XDSButtonGroup label="Actions">
        <XDSButton label="Copy" />
      </XDSButtonGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );

    rerender(
      <XDSButtonGroup label="Actions" orientation="vertical">
        <XDSButton label="Copy" />
      </XDSButtonGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });

  it('renders with vertical orientation', () => {
    render(
      <XDSButtonGroup label="Actions" orientation="vertical">
        <XDSButton label="Copy" />
        <XDSButton label="Cut" />
      </XDSButtonGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const {rerender} = render(
      <XDSButtonGroup label="Actions" size="sm">
        <XDSButton label="Copy" />
      </XDSButtonGroup>,
    );
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();

    rerender(
      <XDSButtonGroup label="Actions" size="lg">
        <XDSButton label="Copy" />
      </XDSButtonGroup>,
    );
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('disables all buttons when isDisabled is true', () => {
    render(
      <XDSButtonGroup label="Actions" isDisabled>
        <XDSButton label="Copy" />
        <XDSButton label="Cut" />
      </XDSButtonGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', {name: 'Copy'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeDisabled();
  });

  it('does not set aria-disabled when not disabled', () => {
    render(
      <XDSButtonGroup label="Actions">
        <XDSButton label="Copy" />
      </XDSButtonGroup>,
    );

    expect(screen.getByRole('group')).not.toHaveAttribute('aria-disabled');
  });

  it('renders a single button without errors', () => {
    render(
      <XDSButtonGroup label="Actions">
        <XDSButton label="Copy" />
      </XDSButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('renders mixed Button and IconButton children', () => {
    render(
      <XDSButtonGroup label="Edit actions">
        <XDSButton label="Edit" />
        <XDSIconButton label="More options" icon={<span>▼</span>} />
      </XDSButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Edit'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'More options'}),
    ).toBeInTheDocument();
  });
});
