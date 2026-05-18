// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSSelectableCard} from './XDSSelectableCard';

describe('XDSSelectableCard', () => {
  it('renders children', () => {
    render(
      <XDSSelectableCard label="Test" isSelected={false} onChange={() => {}}>
        <span>Card content</span>
      </XDSSelectableCard>,
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders a hidden checkbox', () => {
    render(
      <XDSSelectableCard label="Test" isSelected={false} onChange={() => {}}>
        Content
      </XDSSelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Test'});
    expect(checkbox).toBeInTheDocument();
  });

  it('checkbox reflects isSelected=true as checked', () => {
    render(
      <XDSSelectableCard label="Plan A" isSelected={true} onChange={() => {}}>
        Content
      </XDSSelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Plan A'});
    expect(checkbox).toBeChecked();
  });

  it('checkbox reflects isSelected=false as unchecked', () => {
    render(
      <XDSSelectableCard label="Plan B" isSelected={false} onChange={() => {}}>
        Content
      </XDSSelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Plan B'});
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange with true when card surface is clicked (unselected)', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard label="Test" isSelected={false} onChange={handleChange}>
        <span>Content</span>
      </XDSSelectableCard>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when card surface is clicked (selected)', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard label="Test" isSelected={true} onChange={handleChange}>
        <span>Content</span>
      </XDSSelectableCard>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange when checkbox itself is clicked', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard label="Test" isSelected={false} onChange={handleChange}>
        Content
      </XDSSelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Test'});
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('disabled checkbox is disabled', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard
        label="Disabled"
        isSelected={false}
        onChange={handleChange}
        isDisabled
      >
        Content
      </XDSSelectableCard>,
    );
    const checkbox = screen.getByRole('checkbox', {name: 'Disabled'});
    expect(checkbox).toBeDisabled();
  });

  it('does not call onChange when disabled card is clicked', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard
        label="Disabled"
        isSelected={false}
        onChange={handleChange}
        isDisabled
      >
        <span>Content</span>
      </XDSSelectableCard>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
