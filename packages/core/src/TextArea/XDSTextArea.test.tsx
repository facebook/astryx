/**
 * @file XDSTextArea.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTextArea component
 * @output Unit tests for XDSTextArea component behavior
 * @position Testing; validates XDSTextArea.tsx implementation
 *
 * SYNC: When XDSTextArea.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSTextArea} from './XDSTextArea';

describe('XDSTextArea', () => {
  it('renders with label', () => {
    render(<XDSTextArea label="Description" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <XDSTextArea
        label="Description"
        value=""
        onChange={() => {}}
        placeholder="Enter description"
      />,
    );
    expect(
      screen.getByPlaceholderText('Enter description'),
    ).toBeInTheDocument();
  });

  it('calls onChange with value and event when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSTextArea label="Description" value="" onChange={handleChange} />,
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hi');
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenLastCalledWith('i', expect.any(Object));
  });

  it('works with state setter function directly', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    render(<XDSTextArea label="Description" value="" onChange={setValue} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'A');
    expect(setValue).toHaveBeenCalledWith('A', expect.any(Object));
  });

  it('displays controlled value', () => {
    render(
      <XDSTextArea
        label="Description"
        value="Controlled value"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('Controlled value');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSTextArea
        ref={ref}
        label="Description"
        value=""
        onChange={() => {}}
      />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSTextArea
        label="Comments"
        isLabelHidden
        value=""
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Comments');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<XDSTextArea label="Notes" value="" onChange={() => {}} />);
    const label = screen.getByText('Notes');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <XDSTextArea label="Feedback" isRequired value="" onChange={() => {}} />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<XDSTextArea label="Feedback" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
  });

  it('renders with custom rows', () => {
    render(
      <XDSTextArea label="Description" value="" onChange={() => {}} rows={5} />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('renders with default rows of 3', () => {
    render(<XDSTextArea label="Description" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  it('is disabled when isDisabled is true', () => {
    render(
      <XDSTextArea
        label="Description"
        isDisabled
        value=""
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<XDSTextArea label="Description" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSTextArea
        label="Description"
        isDisabled
        value=""
        onChange={handleChange}
      />,
    );

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hi');
    expect(handleChange).not.toHaveBeenCalled();
  });
});
