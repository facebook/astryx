// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.test.tsx
 * @input Uses vitest, @testing-library/react, Switch component
 * @output Unit tests for Switch component behavior
 * @position Testing; validates Switch.tsx implementation
 *
 * SYNC: When Switch.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Switch} from './Switch';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';

afterEach(() => {
  __resetLiveRegionsForTest();
});

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

describe('Switch', () => {
  it('renders with label', () => {
    render(
      <Switch label="Enable notifications" value={false} onChange={() => {}} />,
    );
    expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
  });

  it('renders as off by default', () => {
    render(
      <Switch label="Enable notifications" value={false} onChange={() => {}} />,
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('renders as on when value prop is true', () => {
    render(
      <Switch label="Enable notifications" value={true} onChange={() => {}} />,
    );
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('calls onChange with new checked state when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={handleChange}
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('calls onChange with false when turning off', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={true}
        onChange={handleChange}
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleChange).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('works when clicking on the label', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={handleChange}
      />,
    );

    const label = screen.getByText('Enable notifications');
    await user.click(label);
    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('renders description when provided', () => {
    render(
      <Switch
        label="Dark mode"
        description="Switch to a darker color scheme"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByText('Switch to a darker color scheme'),
    ).toBeInTheDocument();
  });

  it('associates description with switch via aria-describedby', () => {
    render(
      <Switch
        label="Dark mode"
        description="Switch to a darker color scheme"
        value={false}
        onChange={() => {}}
      />,
    );
    const switchEl = screen.getByRole('switch');
    const description = screen.getByText('Switch to a darker color scheme');
    expect(switchEl).toHaveAttribute('aria-describedby', description.id);
  });

  it('is disabled when isDisabled prop is true', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('does not call onChange when isDisabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={handleChange}
        isDisabled
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Switch
        ref={ref}
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <Switch
        label="Toggle row"
        isLabelHidden
        value={false}
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Toggle row');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Toggle row')).toBeInTheDocument();
  });

  it('keeps description linked via aria-describedby when isLabelHidden', () => {
    render(
      <Switch
        label="Toggle row"
        isLabelHidden
        description="Enables sync for this row"
        value={false}
        onChange={() => {}}
      />,
    );
    const switchEl = screen.getByRole('switch');
    const description = screen.getByText('Enables sync for this row');
    expect(description.id).not.toBe('');
    expect(switchEl.getAttribute('aria-describedby')).toContain(description.id);
  });

  it('shows label visually by default', () => {
    render(
      <Switch label="Enable notifications" value={false} onChange={() => {}} />,
    );
    const label = screen.getByText('Enable notifications');
    expect(label).toBeVisible();
  });

  it('renders with labelPosition start (label before switch)', () => {
    const {container} = render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        labelPosition="start"
      />,
    );
    // The outer div wraps the container div which has the label and switch
    const outerDiv = container.firstChild as HTMLElement;
    const containerDiv = outerDiv.firstChild as HTMLElement;
    const children = Array.from(containerDiv.children);
    // First child should be label wrapper, second should be switch wrapper
    expect(children.length).toBe(2);
  });

  it('renders with labelPosition end (switch before label)', () => {
    const {container} = render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        labelPosition="end"
      />,
    );
    // The outer div wraps the container div which has the switch and label
    const outerDiv = container.firstChild as HTMLElement;
    const containerDiv = outerDiv.firstChild as HTMLElement;
    const children = Array.from(containerDiv.children);
    // First child should be switch wrapper, second should be label wrapper
    expect(children.length).toBe(2);
  });

  it('has role="switch" for accessibility', () => {
    render(
      <Switch label="Enable notifications" value={false} onChange={() => {}} />,
    );
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('sets aria-busy on input when loading', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        isLoading
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders status message when status prop is provided', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'error', message: 'Failed to save setting'}}
      />,
    );
    expect(screen.getByText('Failed to save setting')).toBeInTheDocument();
  });

  it('sets aria-invalid when status type is error', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'error', message: 'Error message'}}
      />,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when status type is not error', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'warning', message: 'Warning message'}}
      />,
    );
    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-invalid');
  });

  it('associates status message with switch via aria-describedby', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'error', message: 'Error message'}}
      />,
    );
    const switchEl = screen.getByRole('switch');
    const describedBy = switchEl.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
  });

  // Regression: the status is conditionally mounted, so it must be announced
  // through the persistent useAnnounce live region — a live region born
  // together with its content is not reliably announced.
  it('announces a status message that appears after mount', async () => {
    const {rerender} = render(
      <Switch label="Enable notifications" value={false} onChange={() => {}} />,
    );
    expect(
      document.querySelector('[data-astryx-live-region="assertive"]'),
    ).toBeNull();

    rerender(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'error', message: 'Failed to save setting'}}
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-astryx-live-region="assertive"]'),
      ).toHaveTextContent('Failed to save setting');
    });
  });

  it('calls onFocus and onBlur callbacks', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleFocus).toHaveBeenCalled();

    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('sets required attribute when isRequired is true', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        isRequired
      />,
    );
    expect(screen.getByRole('switch')).toBeRequired();
  });

  describe('disabledMessage', () => {
    const h = {hidden: true} as const;

    function getRow(): HTMLElement {
      return screen.getByRole('switch', h).closest('div')!.parentElement!;
    }

    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent(
        'Notifications are turned off org-wide',
      );
      fireEvent.mouseEnter(getRow());
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
      fireEvent.mouseLeave(getRow());
      await waitFor(() => expect(tooltip).not.toHaveAttribute('popover-open'));
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('switch', h)).toHaveFocus();
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the switch focusable via aria-disabled when a reason is provided', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const control = screen.getByRole('switch', h);
      expect(control).not.toBeDisabled();
      expect(control).toHaveAttribute('aria-disabled', 'true');
    });

    it('links the reason tooltip via aria-describedby', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const control = screen.getByRole('switch', h);
      const tooltip = screen.getByRole('tooltip', h);
      expect(control.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks toggling while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={onChange}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const control = screen.getByRole('switch', h);
      await user.click(control);
      expect(onChange).not.toHaveBeenCalled();
      expect(control).not.toBeChecked();
    });

    it('remains natively disabled when disabled without a reason', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.getByRole('switch')).toBeDisabled();
    });
  });
  describe('labelSpacing', () => {
    const getField = (container: HTMLElement) =>
      container.querySelector<HTMLElement>('.astryx-switch-field')!;

    it('omits the data attribute for the default hug spacing', () => {
      const {container} = render(
        <Switch label="Notify" value={false} onChange={() => {}} />,
      );
      expect(getField(container)).not.toHaveAttribute('data-label-spacing');
    });

    it('reflects spread spacing as a data attribute and variant class', () => {
      const {container} = render(
        <Switch
          label="Notify"
          value={false}
          onChange={() => {}}
          labelSpacing="spread"
        />,
      );
      expect(getField(container)).toHaveAttribute(
        'data-label-spacing',
        'spread',
      );
      expect(getField(container).className).toContain('spread');
    });

    it('renders explicit hug the same as the default', () => {
      const {container: implicit} = render(
        <Switch label="Notify" value={false} onChange={() => {}} />,
      );
      const {container: explicit} = render(
        <Switch
          label="Notify"
          value={false}
          onChange={() => {}}
          labelSpacing="hug"
        />,
      );
      expect(getField(explicit)).not.toHaveAttribute('data-label-spacing');
      expect(getField(explicit).className).toBe(getField(implicit).className);
    });

    it("treats the deprecated 'default' value as an alias for hug", () => {
      const {container: hug} = render(
        <Switch
          label="Notify"
          value={false}
          onChange={() => {}}
          labelSpacing="hug"
        />,
      );
      const {container: deprecated} = render(
        <Switch
          label="Notify"
          value={false}
          onChange={() => {}}
          labelSpacing="default"
        />,
      );
      expect(getField(deprecated)).not.toHaveAttribute('data-label-spacing');
      expect(getField(deprecated).className).toBe(getField(hug).className);
      // The switch row keeps the hug layout, not the spread justification.
      expect(getField(deprecated).firstElementChild?.className).toBe(
        getField(hug).firstElementChild?.className,
      );
    });
  });
  describe('form participation', () => {
    it('submits under htmlName when on', () => {
      const {container} = render(
        <form>
          <Switch
            label="Notify"
            htmlName="notify"
            value={true}
            onChange={() => {}}
          />
        </form>,
      );
      const data = new FormData(container.querySelector('form')!);
      expect(data.get('notify')).toBe('on');
    });

    it('is excluded from form data when disabled, even with a disabledMessage', () => {
      const {container} = render(
        <form>
          <Switch
            label="Notify"
            htmlName="notify"
            value={true}
            onChange={() => {}}
            isDisabled
            disabledMessage="Locked"
          />
        </form>,
      );
      expect([
        ...new FormData(container.querySelector('form')!).keys(),
      ]).toEqual([]);
    });

    it('submits nothing when off or when htmlName is omitted', () => {
      const {container} = render(
        <form>
          <Switch
            label="Off"
            htmlName="off"
            value={false}
            onChange={() => {}}
          />
          <Switch label="Unnamed" value={true} onChange={() => {}} />
        </form>,
      );
      const data = new FormData(container.querySelector('form')!);
      expect([...data.keys()]).toEqual([]);
    });
  });

  describe('rest forwarding', () => {
    it('forwards data-testid, id, and aria-* to the root element', () => {
      const {container} = render(
        <Switch
          label="Notifications"
          value={false}
          onChange={() => {}}
          data-testid="my-switch"
          id="switch-1"
          aria-label="Toggle notifications"
        />,
      );
      const root = container.querySelector('[data-testid="my-switch"]');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('id', 'switch-1');
      expect(root).toHaveAttribute('aria-label', 'Toggle notifications');
    });
  });
});
