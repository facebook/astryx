// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonGroup.test.tsx
 * @input Uses vitest, @testing-library/react, ButtonGroup and Button components
 * @output Unit tests for ButtonGroup
 * @position Testing; validates ButtonGroup component implementation
 *
 * SYNC: When ButtonGroup component changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ButtonGroup} from './ButtonGroup';
import {Button} from '../Button';
import {IconButton} from '../IconButton';

describe('ButtonGroup', () => {
  it('renders a group with aria-label', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
        <Button label="Cut" />
        <Button label="Paste" />
      </ButtonGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Actions');
  });

  it('renders all child buttons', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
        <Button label="Cut" />
        <Button label="Paste" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Paste'})).toBeInTheDocument();
  });

  it('works with IconButton children', () => {
    render(
      <ButtonGroup label="Text formatting">
        <IconButton
          label="Bold"
          icon={<span data-testid="bold-icon">B</span>}
        />
        <IconButton
          label="Italic"
          icon={<span data-testid="italic-icon">I</span>}
        />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Bold'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Italic'})).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    render(
      <ButtonGroup label="Actions" data-testid="my-group">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByTestId('my-group')).toBeInTheDocument();
  });

  it('forwards ref to the root element', () => {
    let refValue: HTMLDivElement | null = null;
    render(
      <ButtonGroup
        label="Actions"
        ref={el => {
          refValue = el;
        }}>
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(refValue).toBeInstanceOf(HTMLDivElement);
    expect(refValue).toBe(screen.getByRole('group'));
  });

  it('reflects orientation via data-orientation, not aria-orientation', () => {
    // aria-orientation is not a valid ARIA attribute on role="group"; the
    // orientation is exposed through data-orientation instead.
    const {rerender} = render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    let group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('aria-orientation');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');

    rerender(
      <ButtonGroup label="Actions" orientation="vertical">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('aria-orientation');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
  });

  it('renders with vertical orientation', () => {
    render(
      <ButtonGroup label="Actions" orientation="vertical">
        <Button label="Copy" />
        <Button label="Cut" />
      </ButtonGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const {rerender} = render(
      <ButtonGroup label="Actions" size="sm">
        <Button label="Copy" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();

    rerender(
      <ButtonGroup label="Actions" size="lg">
        <Button label="Copy" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('disables all buttons when isDisabled is true', () => {
    render(
      <ButtonGroup label="Actions" isDisabled>
        <Button label="Copy" />
        <Button label="Cut" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', {name: 'Copy'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeDisabled();
  });

  it('does not set aria-disabled when not disabled', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('group')).not.toHaveAttribute('aria-disabled');
  });

  it('renders a single button without errors', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('renders mixed Button and IconButton children', () => {
    render(
      <ButtonGroup label="Edit actions">
        <Button label="Edit" />
        <IconButton label="More options" icon={<span>▼</span>} />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Edit'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'More options'}),
    ).toBeInTheDocument();
  });
});
