// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInput.test.tsx
 * @input Uses vitest, @testing-library/react, NumberInput component
 * @output Unit tests for NumberInput component behavior
 * @position Testing; validates NumberInput.tsx implementation
 *
 * SYNC: When NumberInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {HashtagIcon} from '@heroicons/react/24/outline';
import {NumberInput} from './NumberInput';

// Mock showPopover/hidePopover since jsdom does not implement them. Used by the
// disabledMessage tooltip.
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

// jsdom popover content is in the DOM but may not be "visible" in the
// accessibility tree. Use hidden: true to find it.
const h = {hidden: true} as const;

describe('NumberInput', () => {
  it('renders with label', () => {
    render(<NumberInput label="Quantity" value={null} onChange={() => {}} />);
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <NumberInput
        label="Quantity"
        value={null}
        onChange={() => {}}
        placeholder="Enter number"
      />,
    );
    expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
  });

  it('displays controlled value as number', () => {
    render(<NumberInput label="Quantity" value={456} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(456);
  });

  it('displays null for null value', () => {
    render(<NumberInput label="Quantity" value={null} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(null);
  });

  it('displays null for undefined value', () => {
    render(
      <NumberInput label="Quantity" value={undefined} onChange={() => {}} />,
    );
    expect(screen.getByRole('spinbutton')).toHaveValue(null);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <NumberInput
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
      <NumberInput
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
    render(<NumberInput label="Amount" value={null} onChange={() => {}} />);
    const label = screen.getByText('Amount');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <NumberInput
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
    render(<NumberInput label="Quantity" value={null} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(
      <NumberInput
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
      <NumberInput
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
    render(<NumberInput label="Quantity" value={null} onChange={() => {}} />);
    expect(screen.getByRole('spinbutton')).not.toBeDisabled();
  });

  it('renders with startIcon', () => {
    render(
      <NumberInput
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
      <NumberInput label="Quantity" value={null} onChange={() => {}} />,
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('native number input attributes', () => {
    it('sets min attribute', () => {
      render(
        <NumberInput label="Age" value={null} onChange={() => {}} min={0} />,
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute('min', '0');
    });

    it('sets max attribute', () => {
      render(
        <NumberInput label="Age" value={null} onChange={() => {}} max={120} />,
      );
      expect(screen.getByRole('spinbutton')).toHaveAttribute('max', '120');
    });

    it('sets step attribute', () => {
      render(
        <NumberInput
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
        <NumberInput label="Quantity" value={null} onChange={handleChange} />,
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput label="Price" value={null} onChange={handleChange} />,
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
        <NumberInput
          label="Discount"
          value={10}
          onChange={() => {}}
          units="%"
        />,
      );
      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('does not render units when not provided', () => {
      render(<NumberInput label="Amount" value={100} onChange={() => {}} />);
      expect(screen.queryByText('%')).not.toBeInTheDocument();
      expect(screen.queryByText('GB')).not.toBeInTheDocument();
    });
  });

  describe('event callbacks', () => {
    it('calls onFocus when input receives focus', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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
        <NumberInput
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

  describe('invalid typed input feedback (WCAG 3.3.1)', () => {
    it('sets aria-invalid="true" when typed input is unparseable', async () => {
      const user = userEvent.setup();
      render(
        <NumberInput
          label="Count"
          value={null}
          onChange={() => {}}
          isIntegerOnly
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      // "3.5" is invalid when isIntegerOnly is set
      await user.type(input, '3.5');

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid when typed input is valid', async () => {
      const user = userEvent.setup();
      render(<NumberInput label="Count" value={null} onChange={() => {}} />);

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '42');

      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('announces an alert message when typed input is invalid', async () => {
      const user = userEvent.setup();
      render(
        <NumberInput
          label="Count"
          value={null}
          onChange={() => {}}
          isIntegerOnly
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '3.5');

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid number');
    });

    it('does not announce an alert message when input is valid', async () => {
      const user = userEvent.setup();
      render(<NumberInput label="Count" value={null} onChange={() => {}} />);

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.type(input, '42');

      expect(screen.getByRole('alert')).toHaveTextContent('');
      expect(screen.queryByText('Invalid number')).not.toBeInTheDocument();
    });
  });

  it('renders tooltip info icon when labelTooltip is provided', () => {
    render(
      <NumberInput
        label="Help"
        value={null}
        onChange={() => {}}
        labelTooltip="Helpful info"
      />,
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render tooltip icon when labelTooltip is not provided', () => {
    render(<NumberInput label="Quantity" value={null} onChange={() => {}} />);
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('hasAutoFocus prop', () => {
    it('focuses the input when hasAutoFocus is true', () => {
      render(
        <NumberInput
          label="Quantity"
          value={null}
          onChange={() => {}}
          hasAutoFocus
        />,
      );
      expect(screen.getByRole('spinbutton')).toHaveFocus();
    });

    it('does not focus when hasAutoFocus is false', () => {
      render(<NumberInput label="Quantity" value={null} onChange={() => {}} />);
      expect(screen.getByRole('spinbutton')).not.toHaveFocus();
    });
  });

  describe('htmlName prop', () => {
    it('sets name attribute when htmlName is provided', () => {
      render(
        <NumberInput
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
      render(<NumberInput label="Quantity" value={null} onChange={() => {}} />);
      expect(screen.getByRole('spinbutton')).not.toHaveAttribute('name');
    });
  });

  describe('autoComplete prop', () => {
    it('sets autocomplete attribute when autoComplete is provided', () => {
      render(
        <NumberInput
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

  describe('hasClear', () => {
    it('shows clear button when hasClear is true and value exists', () => {
      render(
        <NumberInput label="Qty" value={5} onChange={() => {}} hasClear />,
      );
      expect(
        screen.getByRole('button', {name: 'Clear Qty'}),
      ).toBeInTheDocument();
    });

    it('does not show clear button when value is null', () => {
      render(
        <NumberInput label="Qty" value={null} onChange={() => {}} hasClear />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Qty'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      render(<NumberInput label="Qty" value={5} onChange={() => {}} />);
      expect(
        screen.queryByRole('button', {name: 'Clear Qty'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(
        <NumberInput
          label="Qty"
          value={5}
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Qty'}),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with null when clear is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <NumberInput label="Qty" value={5} onChange={onChange} hasClear />,
      );
      await user.click(screen.getByRole('button', {name: 'Clear Qty'}));
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('click-to-focus', () => {
    it('focuses input when clicking the start icon', () => {
      render(
        <NumberInput
          label="Qty"
          value={0}
          onChange={() => {}}
          startIcon={<HashtagIcon />}
        />,
      );

      const input = screen.getByRole('spinbutton');
      const wrapper = input.parentElement!;
      const iconElement = wrapper.querySelector('svg')!;

      fireEvent.click(iconElement);
      expect(input).toHaveFocus();
    });

    it('focuses input when clicking the wrapper padding', () => {
      render(<NumberInput label="Qty" value={0} onChange={() => {}} />);

      const input = screen.getByRole('spinbutton');
      const wrapper = input.parentElement!;

      fireEvent.click(wrapper);
      expect(input).toHaveFocus();
    });
  });

  describe('disabledMessage', () => {
    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <NumberInput
          label="Quantity"
          value={5}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const input = screen.getByRole('spinbutton');
      const container = input.parentElement as HTMLElement;
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent('You need the Editor role');

      fireEvent.mouseEnter(container);
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });

      fireEvent.mouseLeave(container);
      await waitFor(() => {
        expect(tooltip).not.toHaveAttribute('popover-open');
      });
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <NumberInput
          label="Quantity"
          value={5}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('spinbutton')).toHaveFocus();
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <NumberInput
          label="Quantity"
          value={5}
          onChange={() => {}}
          disabledMessage="You need the Editor role"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <NumberInput
          label="Quantity"
          value={5}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the input focusable via aria-disabled when a reason is provided', () => {
      render(
        <NumberInput
          label="Quantity"
          value={5}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const input = screen.getByRole('spinbutton');
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input).toHaveAttribute('readonly');
    });

    it('links the reason tooltip from the input via aria-describedby', () => {
      render(
        <NumberInput
          label="Quantity"
          value={5}
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const input = screen.getByRole('spinbutton');
      const tooltip = screen.getByRole('tooltip', h);
      expect(input.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks value changes while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <NumberInput
          label="Quantity"
          value={5}
          onChange={onChange}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const input = screen.getByRole('spinbutton');
      await user.click(input);
      await user.keyboard('9');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('remains natively disabled when disabled without a reason', () => {
      render(
        <NumberInput
          label="Quantity"
          value={5}
          onChange={() => {}}
          isDisabled
        />,
      );
      const input = screen.getByRole('spinbutton');
      expect(input).toBeDisabled();
      expect(input).not.toHaveAttribute('aria-disabled');
    });
  });
});

describe('keyboard clearing with hasClear (#3599)', () => {
  it('commits null when the input is emptied and blurred', () => {
    const onChange = vi.fn();
    render(
      <NumberInput label="Qty" hasClear value={42} onChange={onChange} />,
    );
    const input = screen.getByLabelText('Qty');
    fireEvent.change(input, {target: {value: ''}});
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('commits null when the input is emptied and Enter is pressed', () => {
    const onChange = vi.fn();
    render(
      <NumberInput label="Qty" hasClear value={42} onChange={onChange} />,
    );
    const input = screen.getByLabelText('Qty');
    fireEvent.change(input, {target: {value: ''}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('does not fire when emptied and blurred with no prior value', () => {
    const onChange = vi.fn();
    render(
      <NumberInput label="Qty" hasClear value={null} onChange={onChange} />,
    );
    const input = screen.getByLabelText('Qty');
    fireEvent.change(input, {target: {value: ''}});
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('still reverts on blur when hasClear is not set', () => {
    const onChange = vi.fn();
    render(<NumberInput label="Qty" value={42} onChange={onChange} />);
    const input = screen.getByLabelText('Qty');
    fireEvent.change(input, {target: {value: ''}});
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('42');
  });
});
