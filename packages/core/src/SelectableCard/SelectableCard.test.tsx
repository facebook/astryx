// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {SelectableCard} from './SelectableCard';

describe('SelectableCard', () => {
  it('renders children', () => {
    render(
      <SelectableCard label="Test" isSelected={false} onChange={() => {}}>
        <span>Card content</span>
      </SelectableCard>,
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders a hidden checkbox', () => {
    render(
      <SelectableCard label="Test" isSelected={false} onChange={() => {}}>
        Content
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Test'});
    expect(checkbox).toBeInTheDocument();
  });

  it('checkbox reflects isSelected=true as checked', () => {
    render(
      <SelectableCard label="Plan A" isSelected={true} onChange={() => {}}>
        Content
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Plan A'});
    expect(checkbox).toBeChecked();
  });

  it('checkbox reflects isSelected=false as unchecked', () => {
    render(
      <SelectableCard label="Plan B" isSelected={false} onChange={() => {}}>
        Content
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Plan B'});
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange with true when card surface is clicked (unselected)', () => {
    const handleChange = vi.fn();
    render(
      <SelectableCard label="Test" isSelected={false} onChange={handleChange}>
        <span>Content</span>
      </SelectableCard>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when card surface is clicked (selected)', () => {
    const handleChange = vi.fn();
    render(
      <SelectableCard label="Test" isSelected={true} onChange={handleChange}>
        <span>Content</span>
      </SelectableCard>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange when checkbox itself is clicked', () => {
    const handleChange = vi.fn();
    render(
      <SelectableCard label="Test" isSelected={false} onChange={handleChange}>
        Content
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Test'});
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('disabled checkbox is disabled', () => {
    const handleChange = vi.fn();
    render(
      <SelectableCard
        label="Disabled"
        isSelected={false}
        onChange={handleChange}
        isDisabled
      >
        Content
      </SelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Disabled'});
    expect(checkbox).toBeDisabled();
  });

  it('does not call onChange when disabled card is clicked', () => {
    const handleChange = vi.fn();
    render(
      <SelectableCard
        label="Disabled"
        isSelected={false}
        onChange={handleChange}
        isDisabled
      >
        <span>Content</span>
      </SelectableCard>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
