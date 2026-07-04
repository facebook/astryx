// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CheckboxInput.test.tsx
 * @input Uses vitest, @testing-library/react, CheckboxInput component
 * @output Unit tests for CheckboxInput component behavior
 * @position Testing; validates CheckboxInput.tsx implementation
 *
 * SYNC: When CheckboxInput.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {CheckboxInput} from './CheckboxInput';

// Mock showPopover/hidePopover (not implemented in jsdom) so the tooltip layer
// reflects its open state via a `popover-open` attribute the tests can assert.
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

describe('CheckboxInput', () => {
  it('renders with label', () => {
    render(
      <CheckboxInput label="Accept terms" value={false} onChange={() => {}} />,
    );
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('renders as unchecked by default', () => {
    render(
      <CheckboxInput label="Accept terms" value={false} onChange={() => {}} />,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders as checked when value prop is true', () => {
    render(
      <CheckboxInput label="Accept terms" value={true} onChange={() => {}} />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange with new checked state when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <CheckboxInput
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
      <CheckboxInput
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
      <CheckboxInput
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
      <CheckboxInput
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
      <CheckboxInput
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
      <CheckboxInput
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
      <CheckboxInput
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
      <CheckboxInput
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
      <CheckboxInput
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
      <CheckboxInput label="Accept terms" value={false} onChange={() => {}} />,
    );
    const label = screen.getByText('Accept terms');
    expect(label).toBeVisible();
  });

  it('sets aria-busy when loading', () => {
    render(
      <CheckboxInput
        label="Accept terms"
        value={false}
        onChange={() => {}}
        isLoading
      />,
    );
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-busy', 'true');
  });

  it('exposes indeterminate state via the native indeterminate property', () => {
    render(
      <CheckboxInput
        label="Select all"
        value="indeterminate"
        onChange={() => {}}
      />,
    );
    const checkbox = screen.getByRole('checkbox');
    // Native checkboxes expose mixed state through the DOM indeterminate
    // property, which browsers map to aria-checked="mixed". A redundant
    // aria-checked attribute is intentionally NOT set (forms-16).
    expect(checkbox).toBeInstanceOf(HTMLInputElement);
    if (checkbox instanceof HTMLInputElement) {
      expect(checkbox.indeterminate).toBe(true);
    }
    expect(checkbox).not.toHaveAttribute('aria-checked');
  });

  it('renders semantic labelIcon names as icons', () => {
    const {container} = render(
      <CheckboxInput
        label="Accept terms"
        value={false}
        onChange={() => {}}
        labelIcon="info"
      />,
    );

    expect(container.textContent).toBe('Accept terms');
    expect(container.querySelector('.astryx-icon')).toBeInTheDocument();
  });

  it('renders status message and sets aria-invalid for error', () => {
    render(
      <CheckboxInput
        label="Accept terms"
        value={false}
        onChange={() => {}}
        status={{type: 'error', message: 'Required field'}}
      />,
    );
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  describe('disabledMessage', () => {
    const h = {hidden: true} as const;

    function getRow(): HTMLElement {
      return screen.getByRole('checkbox', h).closest('div')!.parentElement!;
    }

    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <CheckboxInput
          label="Accept terms"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Terms are managed by your administrator"
        />,
      );
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent(
        'Terms are managed by your administrator',
      );
      fireEvent.mouseEnter(getRow());
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
      fireEvent.mouseLeave(getRow());
      await waitFor(() => expect(tooltip).not.toHaveAttribute('popover-open'));
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <CheckboxInput
          label="Accept terms"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Terms are managed by your administrator"
        />,
      );
      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('checkbox', h)).toHaveFocus();
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <CheckboxInput
          label="Accept terms"
          value={false}
          onChange={() => {}}
          disabledMessage="Terms are managed by your administrator"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <CheckboxInput
          label="Accept terms"
          value={false}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the checkbox focusable via aria-disabled when a reason is provided', () => {
      render(
        <CheckboxInput
          label="Accept terms"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Terms are managed by your administrator"
        />,
      );
      const checkbox = screen.getByRole('checkbox', h);
      expect(checkbox).not.toBeDisabled();
      expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    });

    it('links the reason tooltip via aria-describedby', () => {
      render(
        <CheckboxInput
          label="Accept terms"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Terms are managed by your administrator"
        />,
      );
      const checkbox = screen.getByRole('checkbox', h);
      const tooltip = screen.getByRole('tooltip', h);
      expect(checkbox.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks toggling while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <CheckboxInput
          label="Accept terms"
          value={false}
          onChange={onChange}
          isDisabled
          disabledMessage="Terms are managed by your administrator"
        />,
      );
      const checkbox = screen.getByRole('checkbox', h);
      await user.click(checkbox);
      expect(onChange).not.toHaveBeenCalled();
      expect(checkbox).not.toBeChecked();
    });

    it('remains natively disabled when disabled without a reason', () => {
      render(
        <CheckboxInput
          label="Accept terms"
          value={false}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });
  describe('form participation', () => {
    it('submits under htmlName when checked', () => {
      const {container} = render(
        <form>
          <CheckboxInput label="Terms" htmlName="terms" value={true} onChange={() => {}} />
        </form>,
      );
      const data = new FormData(container.querySelector('form')!);
      expect(data.get('terms')).toBe('on');
    });

    it('is excluded from form data when disabled, even with a disabledMessage', () => {
      const {container} = render(
        <form>
          <CheckboxInput
            label="Terms"
            htmlName="terms"
            value={true}
            onChange={() => {}}
            isDisabled
            disabledMessage="Locked"
          />
        </form>,
      );
      expect([...new FormData(container.querySelector('form')!).keys()]).toEqual([]);
    });

    it('submits nothing when unchecked', () => {
      const {container} = render(
        <form>
          <CheckboxInput label="Terms" htmlName="terms" value={false} onChange={() => {}} />
        </form>,
      );
      expect([...new FormData(container.querySelector('form')!).keys()]).toEqual([]);
    });
  });
});
