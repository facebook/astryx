/**
 * @file XDSRadioList.test.tsx
 * @input Uses vitest, @testing-library/react, XDSRadioList, XDSRadioListItem
 * @output Unit tests for XDSRadioList and XDSRadioListItem behavior
 * @position Testing; validates XDSRadioList.tsx and XDSRadioListItem.tsx implementation
 *
 * SYNC: When XDSRadioList.tsx or XDSRadioListItem.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSRadioList} from './XDSRadioList';
import {XDSRadioListItem} from './XDSRadioListItem';

describe('XDSRadioList', () => {
  it('renders with label', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}}>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByText('Preference')).toBeInTheDocument();
  });

  it('renders radio items', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}}>
        <XDSRadioListItem label="Option A" value="a" />
        <XDSRadioListItem label="Option B" value="b" />
        <XDSRadioListItem label="Option C" value="c" />
      </XDSRadioList>,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('renders radiogroup role', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}}>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('selects the correct radio based on value prop', () => {
    render(
      <XDSRadioList label="Preference" value="b" onChange={() => {}}>
        <XDSRadioListItem label="Option A" value="a" />
        <XDSRadioListItem label="Option B" value="b" />
        <XDSRadioListItem label="Option C" value="c" />
      </XDSRadioList>,
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
      <XDSRadioList label="Preference" value="a" onChange={handleChange}>
        <XDSRadioListItem label="Option A" value="a" />
        <XDSRadioListItem label="Option B" value="b" />
      </XDSRadioList>,
    );

    await user.click(screen.getByLabelText('Option B'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('calls onChange when clicking on a label', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSRadioList label="Preference" value="a" onChange={handleChange}>
        <XDSRadioListItem label="Option A" value="a" />
        <XDSRadioListItem label="Option B" value="b" />
      </XDSRadioList>,
    );

    await user.click(screen.getByText('Option B'));
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('disables all radios when group isDisabled is true', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}} isDisabled>
        <XDSRadioListItem label="Option A" value="a" />
        <XDSRadioListItem label="Option B" value="b" />
      </XDSRadioList>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeDisabled();
    expect(radios[1]).toBeDisabled();
  });

  it('does not call onChange when group is disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSRadioList
        label="Preference"
        value=""
        onChange={handleChange}
        isDisabled>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );

    await user.click(screen.getByLabelText('Option A'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables individual item when item isDisabled is true', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}}>
        <XDSRadioListItem label="Option A" value="a" />
        <XDSRadioListItem label="Option B" value="b" isDisabled />
      </XDSRadioList>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeDisabled();
    expect(radios[1]).toBeDisabled();
  });

  it('does not call onChange when individual item is disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSRadioList label="Preference" value="" onChange={handleChange}>
        <XDSRadioListItem label="Option A" value="a" isDisabled />
      </XDSRadioList>,
    );

    await user.click(screen.getByLabelText('Option A'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('shows Required indicator when isRequired is true', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}} isRequired>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('shows Optional indicator when isOptional is true', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}} isOptional>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders error status message', () => {
    render(
      <XDSRadioList
        label="Preference"
        value=""
        onChange={() => {}}
        status={{type: 'error', message: 'Please select an option'}}>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('renders warning status message', () => {
    render(
      <XDSRadioList
        label="Preference"
        value="a"
        onChange={() => {}}
        status={{type: 'warning', message: 'This may change later'}}>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByText('This may change later')).toBeInTheDocument();
  });

  it('renders success status message', () => {
    render(
      <XDSRadioList
        label="Preference"
        value="a"
        onChange={() => {}}
        status={{type: 'success', message: 'Great choice!'}}>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByText('Great choice!')).toBeInTheDocument();
  });

  it('sets aria-invalid on radiogroup when status is error', () => {
    render(
      <XDSRadioList
        label="Preference"
        value=""
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('renders startContent', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}}>
        <XDSRadioListItem
          label="Option A"
          value="a"
          startContent={<span data-testid="start">★</span>}
        />
      </XDSRadioList>,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}}>
        <XDSRadioListItem
          label="Option A"
          value="a"
          endContent={<span data-testid="end">Badge</span>}
        />
      </XDSRadioList>,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('supports data-testid on RadioList', () => {
    render(
      <XDSRadioList
        label="Preference"
        value=""
        onChange={() => {}}
        data-testid="my-radio-list">
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByTestId('my-radio-list')).toBeInTheDocument();
  });

  it('supports data-testid on RadioListItem', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}}>
        <XDSRadioListItem
          label="Option A"
          value="a"
          data-testid="my-radio-item"
        />
      </XDSRadioList>,
    );
    expect(screen.getByTestId('my-radio-item')).toBeInTheDocument();
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSRadioList
        label="Hidden label"
        isLabelHidden
        value=""
        onChange={() => {}}>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
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
      <XDSRadioList label="Preference" value="" onChange={() => {}}>
        <XDSRadioListItem
          label="Option A"
          value="a"
          description="This is option A"
        />
      </XDSRadioList>,
    );
    expect(screen.getByText('This is option A')).toBeInTheDocument();
  });

  it('renders description on the radio list group', () => {
    render(
      <XDSRadioList
        label="Preference"
        description="Choose your preference"
        value=""
        onChange={() => {}}>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByText('Choose your preference')).toBeInTheDocument();
  });

  it('applies horizontal orientation', () => {
    render(
      <XDSRadioList
        label="Preference"
        value=""
        onChange={() => {}}
        orientation="horizontal">
        <XDSRadioListItem label="Option A" value="a" />
        <XDSRadioListItem label="Option B" value="b" />
      </XDSRadioList>,
    );
    // The radiogroup should exist and contain items
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('sets aria-required on radiogroup when isRequired is true', () => {
    render(
      <XDSRadioList label="Preference" value="" onChange={() => {}} isRequired>
        <XDSRadioListItem label="Option A" value="a" />
      </XDSRadioList>,
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });
});
