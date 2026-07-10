// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TextInput.test.tsx
 * @input Uses vitest, @testing-library/react, TextInput component
 * @output Unit tests for TextInput component behavior
 * @position Testing; validates TextInput.tsx implementation
 *
 * SYNC: When TextInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TestIcon} from '../__tests__/TestIcon';
import {TextInput} from './TextInput';

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

describe('TextInput', () => {
  it('renders with label', () => {
    render(<TextInput label="Name" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <TextInput
        label="Name"
        value=""
        onChange={() => {}}
        placeholder="Enter text"
      />,
    );
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('calls onChange with value and event when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextInput label="Name" value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hi');
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenLastCalledWith('i', expect.any(Object));
  });

  it('works with state setter function directly', async () => {
    const user = userEvent.setup();
    const setValue = vi.fn();
    render(<TextInput label="Name" value="" onChange={setValue} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'A');
    expect(setValue).toHaveBeenCalledWith('A', expect.any(Object));
  });

  it('renders empty string when value is undefined', () => {
    // @ts-expect-error — testing runtime safety when value is omitted
    render(<TextInput label="Name" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('displays controlled value', () => {
    render(
      <TextInput label="Name" value="Controlled value" onChange={() => {}} />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('Controlled value');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<TextInput ref={ref} label="Name" value="" onChange={() => {}} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <TextInput label="Search" isLabelHidden value="" onChange={() => {}} />,
    );
    const label = screen.getByText('Search');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('shows label visually by default', () => {
    render(<TextInput label="Email" value="" onChange={() => {}} />);
    const label = screen.getByText('Email');
    expect(label).toBeVisible();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <TextInput label="Username" isRequired value="" onChange={() => {}} />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(<TextInput label="Username" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required');
  });

  it('sets disabled attribute when isDisabled is true', () => {
    render(<TextInput label="Name" isDisabled value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('does not fire onChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <TextInput label="Name" isDisabled value="" onChange={handleChange} />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('is not disabled by default', () => {
    render(<TextInput label="Name" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).not.toBeDisabled();
  });

  it('renders with startIcon', () => {
    render(
      <TextInput
        label="Search"
        value=""
        onChange={() => {}}
        startIcon={TestIcon}
      />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Icon should be rendered (as an SVG element)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders without icon wrapper when startIcon is not provided', () => {
    const {container} = render(
      <TextInput label="Name" value="" onChange={() => {}} />,
    );
    // No SVG should be present
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('status prop', () => {
    it('renders with error status icon', () => {
      const {container} = render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with warning status icon', () => {
      const {container} = render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'warning'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders with success status icon', () => {
      const {container} = render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'success'}}
        />,
      );
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders status message when provided', () => {
      render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error', message: 'Invalid email address'}}
        />,
      );
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('does not render status message when not provided', () => {
      render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });

    it('sets aria-invalid when status type is error', () => {
      render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error'}}
        />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    it('does not set aria-invalid for warning status', () => {
      render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'warning'}}
        />,
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    });

    it('does not set aria-invalid for success status', () => {
      render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'success'}}
        />,
      );
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    });

    it('includes status message in aria-describedby', () => {
      render(
        <TextInput
          label="Email"
          value=""
          onChange={() => {}}
          status={{type: 'error', message: 'Invalid email'}}
        />,
      );
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      // The status message should be reachable via the described-by ID
      const messageElement = screen.getByText('Invalid email');
      expect(messageElement).toHaveAttribute('id');
      expect(describedBy).toContain(messageElement.id);
    });
  });

  it('renders tooltip info icon when labelTooltip is provided', () => {
    render(
      <TextInput
        label="Help"
        value=""
        onChange={() => {}}
        labelTooltip="Helpful info"
      />,
    );
    // Info icon should be present
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render tooltip icon when labelTooltip is not provided', () => {
    render(<TextInput label="Name" value="" onChange={() => {}} />);
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  describe('hasAutoFocus prop', () => {
    it('focuses the input when hasAutoFocus is true', () => {
      render(
        <TextInput label="Name" value="" onChange={() => {}} hasAutoFocus />,
      );
      expect(screen.getByRole('textbox')).toHaveFocus();
    });

    it('does not focus when hasAutoFocus is false', () => {
      render(<TextInput label="Name" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).not.toHaveFocus();
    });
  });

  describe('htmlName prop', () => {
    it('sets name attribute when htmlName is provided', () => {
      render(
        <TextInput
          label="Name"
          value=""
          onChange={() => {}}
          htmlName="username"
        />,
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('does not set name attribute when htmlName is not provided', () => {
      render(<TextInput label="Name" value="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('name');
    });
  });

  describe('onEnter', () => {
    it('calls onEnter when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleEnter = vi.fn();
      render(
        <TextInput
          label="Name"
          value="hello"
          onChange={() => {}}
          onEnter={handleEnter}
        />,
      );
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Enter}');
      expect(handleEnter).toHaveBeenCalledTimes(1);
    });

    it('does not call onEnter for other keys', async () => {
      const user = userEvent.setup();
      const handleEnter = vi.fn();
      render(
        <TextInput
          label="Name"
          value=""
          onChange={() => {}}
          onEnter={handleEnter}
        />,
      );
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('abc');
      expect(handleEnter).not.toHaveBeenCalled();
    });
  });

  describe('onKeyDown', () => {
    it('passes through onKeyDown events', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();
      render(
        <TextInput
          label="Name"
          value=""
          onChange={() => {}}
          onKeyDown={handleKeyDown}
        />,
      );
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('a');
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('calls both onKeyDown and onEnter on Enter', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();
      const handleEnter = vi.fn();
      render(
        <TextInput
          label="Name"
          value=""
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onEnter={handleEnter}
        />,
      );
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('{Enter}');
      expect(handleEnter).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasClear', () => {
    it('shows clear button when hasClear is true and value is non-empty', () => {
      render(
        <TextInput label="Name" value="hello" onChange={() => {}} hasClear />,
      );
      expect(
        screen.getByRole('button', {name: 'Clear Name'}),
      ).toBeInTheDocument();
    });

    it('does not show clear button when value is empty', () => {
      render(<TextInput label="Name" value="" onChange={() => {}} hasClear />);
      expect(
        screen.queryByRole('button', {name: 'Clear Name'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when hasClear is false', () => {
      render(<TextInput label="Name" value="hello" onChange={() => {}} />);
      expect(
        screen.queryByRole('button', {name: 'Clear Name'}),
      ).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(
        <TextInput
          label="Name"
          value="hello"
          onChange={() => {}}
          hasClear
          isDisabled
        />,
      );
      expect(
        screen.queryByRole('button', {name: 'Clear Name'}),
      ).not.toBeInTheDocument();
    });

    it('calls onChange with empty string when clear is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextInput label="Name" value="hello" onChange={onChange} hasClear />,
      );
      await user.click(screen.getByRole('button', {name: 'Clear Name'}));
      expect(onChange).toHaveBeenCalledWith('', null);
    });
  });

  describe('click-to-focus', () => {
    it('focuses input when clicking the start icon', () => {
      render(
        <TextInput
          label="Search"
          value=""
          onChange={() => {}}
          startIcon={<TestIcon />}
        />,
      );

      const input = screen.getByRole('textbox');
      const wrapper = input.parentElement!;
      // The icon is rendered before the input; grab the first non-input child
      const iconElement = wrapper.querySelector('svg')!;

      fireEvent.click(iconElement);
      expect(input).toHaveFocus();
    });

    it('focuses input when clicking the wrapper padding', () => {
      render(<TextInput label="Name" value="" onChange={() => {}} />);

      const input = screen.getByRole('textbox');
      const wrapper = input.parentElement!;

      fireEvent.click(wrapper);
      expect(input).toHaveFocus();
    });
  });

  describe('width prop (#2755)', () => {
    it('sizes the outer field, not just the input wrapper', () => {
      render(
        <TextInput label="Name" value="" onChange={() => {}} width="100%" />,
      );
      const input = screen.getByRole('textbox');
      const inputWrapper = input.parentElement!;
      // Field root is the labelled ancestor that owns the width.
      const fieldRoot = input.closest('.astryx-field') as HTMLElement;
      expect(fieldRoot).toBeTruthy();
      expect(fieldRoot.getAttribute('style')).toContain('100%');
      // The inner control wrapper is not the element carrying the width.
      expect(fieldRoot).not.toBe(inputWrapper);
      expect(inputWrapper.getAttribute('style') ?? '').not.toContain('100%');
    });

    it('does not set width when the prop is omitted', () => {
      render(<TextInput label="Name" value="" onChange={() => {}} />);
      const fieldRoot = screen
        .getByRole('textbox')
        .closest('.astryx-field') as HTMLElement;
      expect(fieldRoot.getAttribute('style') ?? '').not.toContain('100%');
    });
  });

  describe('disabledMessage', () => {
    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <TextInput
          label="Owner"
          value=""
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const input = screen.getByRole('textbox');
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
        <TextInput
          label="Owner"
          value=""
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();
      await waitFor(() => {
        expect(tooltip).toHaveAttribute('popover-open');
      });
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <TextInput
          label="Owner"
          value=""
          onChange={() => {}}
          disabledMessage="You need the Editor role"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <TextInput label="Owner" value="" onChange={() => {}} isDisabled />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the input focusable via aria-disabled when a reason is provided', () => {
      render(
        <TextInput
          label="Owner"
          value=""
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const input = screen.getByRole('textbox');
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute('aria-disabled', 'true');
      expect(input).toHaveAttribute('readonly');
    });

    it('links the reason tooltip from the input via aria-describedby', () => {
      render(
        <TextInput
          label="Owner"
          value=""
          onChange={() => {}}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );
      const input = screen.getByRole('textbox');
      const tooltip = screen.getByRole('tooltip', h);
      expect(input.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks value changes while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <TextInput
          label="Owner"
          value=""
          onChange={onChange}
          isDisabled
          disabledMessage="You need the Editor role"
        />,
      );

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.keyboard('hello');
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('');
    });

    it('remains natively disabled when disabled without a reason', () => {
      render(
        <TextInput label="Owner" value="" onChange={() => {}} isDisabled />,
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).not.toHaveAttribute('aria-disabled');
    });
  });
});
