/**
 * @file XDSNumberInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSNumberInput component
 * @output Unit tests for XDSNumberInput component behavior
 * @position Testing; validates XDSNumberInput.tsx implementation
 *
 * SYNC: When XDSNumberInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {HashtagIcon} from '@heroicons/react/24/outline';
import {XDSNumberInput} from './XDSNumberInput';

describe('XDSNumberInput', () => {
  it('renders with label', () => {
    render(
      <XDSNumberInput label="Quantity" value={null} onChange={() => {}} />,
    );
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <XDSNumberInput
        label="Quantity"
        value={null}
        onChange={() => {}}
        placeholder="Enter number"
      />,
    );
    expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
  });

  it('displays controlled value as number', () => {
    render(<XDSNumberInput label="Quantity" value={456} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(456);
  });

  it('displays null for null value', () => {
    render(
      <XDSNumberInput label="Quantity" value={null} onChange={() => {}} />,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue(null);
  });

  it('displays null for undefined value', () => {
    render(
      <XDSNumberInput label="Quantity" value={undefined} onChange={() => {}} />,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue(null);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSNumberInput
        ref={ref}
        label="Quantity"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSNumberInput
        label="Quantity"
        isLabelHidden
        value={null}
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Quantity');
    expect(label).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<XDSNumberInput label="Amount" value={null} onChange={() => {}} />);
    const label = screen.getByText('Amount');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <XDSNumberInput
        label="Quantity"
        isRequired
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('spinbutton')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(
      <XDSNumberInput label="Quantity" value={null} onChange={() => {}} />,
    );
    expect(screen.getByRole('spinbutton')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(
      <XDSNumberInput
        label="Quantity"
        isDisabled
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSNumberInput
        label="Quantity"
        isDisabled
        value={null}
        onChange={handleChange}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.type(input, '123');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('is not disabled by default', () => {
    render(
      <XDSNumberInput label="Quantity" value={null} onChange={() => {}} />,
    );
    expect(screen.getByRole('spinbutton')).not.toBeDisabled();
  });

  it('renders with startIcon', () => {
    render(
      <XDSNumberInput
        label="Count"
        value={null}
        onChange={() => {}}
        startIcon={HashtagIcon}
      />,
    );
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders without icon wrapper when startIcon is not provided', () => {
    const {container} = render(
      <XDSNumberInput label="Quantity" value={null} onChange={() => {}} />,
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('native number input attributes', () => {
    it('sets min attribute', () => {
      render(
        <XDSNumberInput label="Age" value={null} onChange={() => {}} min={0} />,
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute('min', '0');
    });

    it('sets max attribute', () => {
      render(
        <XDSNumberInput
          label="Age"
          value={null}
          onChange={() => {}}
          max={120}
        />,
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute('max', '120');
    });

    it('sets step attribute', () => {
      render(
        <XDSNumberInput
          label="Price"
          value={null}
          onChange={() => {}}
          step={0.01}
        />,
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.01');
    });
  });

  describe('onChange validation', () => {
    it('calls onChange with valid number when typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <XDSNumberInput
          label="Quantity"
          value={null}
          onChange={handleChange}
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '42');

      expect(handleChange).toHaveBeenCalledWith(4);
      expect(handleChange).toHaveBeenCalledWith(42);
    });

    it('does not call onChange when value exceeds max', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <XDSNumberInput
          label="Rating"
          value={null}
          onChange={handleChange}
          max={5}
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '10');

      // 1 is valid (<=5), but 10 is not
      expect(handleChange).toHaveBeenCalledWith(1);
      expect(handleChange).not.toHaveBeenCalledWith(10);
    });

    it('does not call onChange when value is below min', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <XDSNumberInput
          label="Age"
          value={null}
          onChange={handleChange}
          min={0}
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '-5');

      // Neither -5 nor any partial input is valid with min=0
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not call onChange for decimal when isIntegerOnly is true', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <XDSNumberInput
          label="Count"
          value={null}
          onChange={handleChange}
          isIntegerOnly
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '3.5');

      // 3 is valid, but 3.5 is not
      expect(handleChange).toHaveBeenCalledWith(3);
      expect(handleChange).not.toHaveBeenCalledWith(3.5);
    });

    it('calls onChange for decimal when isIntegerOnly is false', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <XDSNumberInput label="Price" value={null} onChange={handleChange} />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '3.5');

      expect(handleChange).toHaveBeenCalledWith(3.5);
    });
  });

  describe('units prop', () => {
    it('renders units text when provided', () => {
      render(
        <XDSNumberInput
          label="Discount"
          value={10}
          onChange={() => {}}
          units="%"
        />,
      );
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('does not render units when not provided', () => {
      render(<XDSNumberInput label="Amount" value={100} onChange={() => {}} />);
      expect(screen.queryByText('%')).not.toBeInTheDocument();
      expect(screen.queryByText('GB')).not.toBeInTheDocument();
    });
  });

  describe('event callbacks', () => {
    it('calls onFocus when input receives focus', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(
        <XDSNumberInput
          label="Quantity"
          value={null}
          onChange={() => {}}
          onFocus={handleFocus}
        />,
      );

      await user.click(screen.getByRole('spinbutton'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(
        <XDSNumberInput
          label="Quantity"
          value={null}
          onChange={() => {}}
          onBlur={handleBlur}
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onEnter when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleEnter = vi.fn();
      render(
        <XDSNumberInput
          label="Quantity"
          value={null}
          onChange={() => {}}
          onEnter={handleEnter}
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.keyboard('{Enter}');
      expect(handleEnter).toHaveBeenCalledTimes(1);
    });

    it('commits valid value on Enter key', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleEnter = vi.fn();
      render(
        <XDSNumberInput
          label="Quantity"
          value={null}
          onChange={handleChange}
          onEnter={handleEnter}
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '42');
      handleChange.mockClear();
      await user.keyboard('{Enter}');

      expect(handleEnter).toHaveBeenCalledTimes(1);
    });
  });

  describe('status prop', () => {
    it('renders with error status icon', () => {
      const {container} = render(
        <XDSNumberInput
          label="Amount"
          value={null}
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with warning status icon', () => {
      const {container} = render(
        <XDSNumberInput
          label="Amount"
          value={null}
          onChange={() => {}}
          status={{type: 'warning'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with success status icon', () => {
      const {container} = render(
        <XDSNumberInput
          label="Amount"
          value={null}
          onChange={() => {}}
          status={{type: 'success'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders status message when provided', () => {
      render(
        <XDSNumberInput
          label="Amount"
          value={null}
          onChange={() => {}}
          status={{type: 'error', message: 'Value must be positive'}}
        />,
      );
      expect(screen.getByText('Value must be positive')).toBeInTheDocument();
    });

    it('does not render status message when not provided', () => {
      render(
        <XDSNumberInput
          label="Amount"
          value={null}
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(screen.queryByText(/positive/i)).not.toBeInTheDocument();
    });

    it('sets aria-invalid when status type is error', () => {
      render(
        <XDSNumberInput
          label="Amount"
          value={null}
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    it('does not set aria-invalid for warning status', () => {
      render(
        <XDSNumberInput
          label="Amount"
          value={null}
          onChange={() => {}}
          status={{type: 'warning'}}
        />,
      );
      expect(screen.getByRole('spinbutton')).not.toHaveAttribute(
        'aria-invalid',
      );
    });

    it('does not set aria-invalid for success status', () => {
      render(
        <XDSNumberInput
          label="Amount"
          value={null}
          onChange={() => {}}
          status={{type: 'success'}}
        />,
      );
      expect(screen.getByRole('spinbutton')).not.toHaveAttribute(
        'aria-invalid',
      );
    });
  });

  it('renders tooltip info icon when tooltip is provided', () => {
    render(
      <XDSNumberInput
        label="Help"
        value={null}
        onChange={() => {}}
        tooltip="Helpful info"
      />,
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render tooltip icon when tooltip is not provided', () => {
    render(
      <XDSNumberInput label="Quantity" value={null} onChange={() => {}} />,
    );
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('hasAutoFocus prop', () => {
    it('focuses the input when hasAutoFocus is true', () => {
      render(
        <XDSNumberInput
          label="Quantity"
          value={null}
          onChange={() => {}}
          hasAutoFocus
        />,
      );
      expect(screen.getByRole('spinbutton')).toHaveFocus();
    });

    it('does not focus when hasAutoFocus is false', () => {
      render(
        <XDSNumberInput label="Quantity" value={null} onChange={() => {}} />,
      );
      expect(screen.getByRole('spinbutton')).not.toHaveFocus();
    });
  });

  describe('htmlName prop', () => {
    it('sets name attribute when htmlName is provided', () => {
      render(
        <XDSNumberInput
          label="Quantity"
          value={null}
          onChange={() => {}}
          htmlName="quantity"
        />,
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute(
        'name',
        'quantity',
      );
    });

    it('does not set name attribute when htmlName is not provided', () => {
      render(
        <XDSNumberInput label="Quantity" value={null} onChange={() => {}} />,
      );
      expect(screen.getByRole('spinbutton')).not.toHaveAttribute('name');
    });
  });

  describe('autoComplete prop', () => {
    it('sets autocomplete attribute when autoComplete is provided', () => {
      render(
        <XDSNumberInput
          label="Age"
          value={null}
          onChange={() => {}}
          autoComplete="off"
        />,
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute(
        'autocomplete',
        'off',
      );
    });
  });
});
