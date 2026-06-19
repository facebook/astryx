// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioList.test.tsx
 * @input Uses vitest, @testing-library/react, RadioList, RadioListItem
 * @output Unit tests for RadioList and RadioListItem behavior
 * @position Testing; validates RadioList.tsx and RadioListItem.tsx implementation
 *
 * SYNC: When RadioList.tsx or RadioListItem.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RadioList} from './RadioList';
import {RadioListItem} from './RadioListItem';

describe('RadioList', () => {
  it('renders with label', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('Preference')).toBeInTheDocument();
  });

  it('renders radio items', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
        <RadioListItem label="Option C" value="c" />
      </RadioList>,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('renders radiogroup role', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('selects the correct radio based on value prop', () => {
    render(
      <RadioList label="Preference" value="b" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
        <RadioListItem label="Option C" value="c" />
      </RadioList>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
    expect(radios[2]).not.toBeChecked();
  });

  it('calls onChange with value string when clicking a radio', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioList label="Preference" value="a" onChange={handleChange}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );

    await user.click(screen.getByLabelText('Option B'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('calls onChange when clicking on a label', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioList label="Preference" value="a" onChange={handleChange}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );

    await user.click(screen.getByText('Option B'));
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('disables all radios when group isDisabled is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}} isDisabled>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeDisabled();
    expect(radios[1]).toBeDisabled();
  });

  it('does not call onChange when group is disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={handleChange}
        isDisabled>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );

    await user.click(screen.getByLabelText('Option A'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables individual item when item isDisabled is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" isDisabled />
      </RadioList>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeDisabled();
    expect(radios[1]).toBeDisabled();
  });

  it('does not call onChange when individual item is disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioList label="Preference" value="" onChange={handleChange}>
        <RadioListItem label="Option A" value="a" isDisabled />
      </RadioList>,
    );

    await user.click(screen.getByLabelText('Option A'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('shows Required indicator when isRequired is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}} isRequired>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('shows Optional indicator when isOptional is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}} isOptional>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders error status message', () => {
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={() => {}}
        status={{type: 'error', message: 'Please select an option'}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('renders warning status message', () => {
    render(
      <RadioList
        label="Preference"
        value="a"
        onChange={() => {}}
        status={{type: 'warning', message: 'This may change later'}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('This may change later')).toBeInTheDocument();
  });

  it('renders success status message', () => {
    render(
      <RadioList
        label="Preference"
        value="a"
        onChange={() => {}}
        status={{type: 'success', message: 'Great choice!'}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('Great choice!')).toBeInTheDocument();
  });

  it('sets aria-invalid on radiogroup when status is error', () => {
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('renders startContent', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem
          label="Option A"
          value="a"
          startContent={<span data-testid="start">★</span>}
        />
      </RadioList>,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem
          label="Option A"
          value="a"
          endContent={<span data-testid="end">Badge</span>}
        />
      </RadioList>,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('supports data-testid on RadioList', () => {
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={() => {}}
        data-testid="my-radio-list">
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByTestId('my-radio-list')).toBeInTheDocument();
  });

  it('supports data-testid on RadioListItem', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem
          label="Option A"
          value="a"
          data-testid="my-radio-item"
        />
      </RadioList>,
    );
    expect(screen.getByTestId('my-radio-item')).toBeInTheDocument();
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <RadioList
        label="Hidden label"
        isLabelHidden
        value=""
        onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    const label = screen.getByText('Hidden label');
    expect(label).toBeInTheDocument();
    // The radiogroup should still be labeled
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-label',
      'Hidden label',
    );
  });

  it('renders description on items', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}}>
        <RadioListItem
          label="Option A"
          value="a"
          description="This is option A"
        />
      </RadioList>,
    );
    expect(screen.getByText('This is option A')).toBeInTheDocument();
  });

  it('renders description on the radio list group', () => {
    render(
      <RadioList
        label="Preference"
        description="Choose your preference"
        value=""
        onChange={() => {}}>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByText('Choose your preference')).toBeInTheDocument();
  });

  it('applies horizontal orientation', () => {
    render(
      <RadioList
        label="Preference"
        value=""
        onChange={() => {}}
        orientation="horizontal">
        <RadioListItem label="Option A" value="a" />
        <RadioListItem label="Option B" value="b" />
      </RadioList>,
    );
    // The radiogroup should exist and contain items
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('sets aria-required on radiogroup when isRequired is true', () => {
    render(
      <RadioList label="Preference" value="" onChange={() => {}} isRequired>
        <RadioListItem label="Option A" value="a" />
      </RadioList>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });
});
