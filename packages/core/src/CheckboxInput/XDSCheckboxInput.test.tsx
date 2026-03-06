/**
 * @file XDSCheckboxInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCheckboxInput component
 * @output Unit tests for XDSCheckboxInput component behavior
 * @position Testing; validates XDSCheckboxInput.tsx implementation
 *
 * SYNC: When XDSCheckboxInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSCheckboxInput} from './XDSCheckboxInput';

describe('XDSCheckboxInput', () => {
  it('renders with label', () => {
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('renders as unchecked by default', () => {
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders as checked when value prop is true', () => {
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={true}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange with new checked state when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={false}
        onChange={handleChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('calls onChange with false when unchecking', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={true}
        onChange={handleChange}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('works when clicking on the label', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={false}
        onChange={handleChange}
      />,
    );

    const label = screen.getByText('Accept terms');
    await user.click(label);
    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('renders description when provided', () => {
    render(
      <XDSCheckboxInput
        label="Subscribe"
        description="Receive weekly updates"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Receive weekly updates')).toBeInTheDocument();
  });

  it('associates description with checkbox via aria-describedby', () => {
    render(
      <XDSCheckboxInput
        label="Subscribe"
        description="Receive weekly updates"
        value={false}
        onChange={() => {}}
      />,
    );
    const checkbox = screen.getByRole('checkbox');
    const description = screen.getByText('Receive weekly updates');
    expect(checkbox).toHaveAttribute('aria-describedby', description.id);
  });

  it('is disabled when isDisabled prop is true', () => {
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={false}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('does not call onChange when isDisabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={false}
        onChange={handleChange}
        isDisabled
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSCheckboxInput
        ref={ref}
        label="Accept terms"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSCheckboxInput
        label="Select row"
        isLabelHidden
        value={false}
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Select row');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Select row')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={false}
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Accept terms');
    expect(label).toBeVisible();
  });

  it('sets aria-busy when loading', () => {
    render(
      <XDSCheckboxInput
        label="Accept terms"
        value={false}
        onChange={() => {}}
        isLoading
      />,
    );
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-busy', 'true');
  });
});
