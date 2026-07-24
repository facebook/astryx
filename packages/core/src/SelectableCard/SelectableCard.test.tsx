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
        isDisabled>
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
        isDisabled>
        <span>Content</span>
      </SelectableCard>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  describe('elevation', () => {
    const noop = () => {};

    it('forwards a distinct elevation class to the card for each level', () => {
      const classFor = (elevation: 'none' | 'low' | 'med' | 'high') => {
        const {container} = render(
          <SelectableCard
            label="Card"
            isSelected={false}
            onChange={noop}
            elevation={elevation}>
            Content
          </SelectableCard>,
        );
        return container.firstElementChild!.className;
      };
      const classes = new Set([
        classFor('none'),
        classFor('low'),
        classFor('med'),
        classFor('high'),
      ]);
      expect(classes.size).toBe(4);
    });

    it('still varies elevation while selected (ring composes with elevation)', () => {
      const selectedClassFor = (elevation: 'none' | 'med') => {
        const {container} = render(
          <SelectableCard
            label="Card"
            isSelected
            onChange={noop}
            elevation={elevation}>
            Content
          </SelectableCard>,
        );
        return container.firstElementChild!.className;
      };
      // A selected card at 'med' must differ from a selected card at 'none' —
      // proving the selection ring does not clobber the elevation shadow.
      expect(selectedClassFor('med')).not.toBe(selectedClassFor('none'));
    });
  });
});
