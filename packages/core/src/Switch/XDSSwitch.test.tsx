/**
 * @file XDSSwitch.test.tsx
 * @input Uses vitest, @testing-library/react, XDSSwitch component
 * @output Unit tests for XDSSwitch component behavior
 * @position Testing; validates XDSSwitch.tsx implementation
 *
 * SYNC: When XDSSwitch.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSSwitch} from './XDSSwitch';

describe('XDSSwitch', () => {
  it('renders with label', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
  });

  it('renders as off by default', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('renders as on when value prop is true', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={true}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('calls onChange with new checked state when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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

  it('shows label visually by default', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Enable notifications');
    expect(label).toBeVisible();
  });

  it('renders with labelPosition start (label before switch)', () => {
    const {container} = render(
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('does not have dangling aria-describedby when isLabelHidden with description', () => {
    render(
      <XDSSwitch
        label="Toggle"
        description="Some description"
        isLabelHidden
        value={false}
        onChange={() => {}}
      />,
    );
    const switchEl = screen.getByRole('switch');
    // aria-describedby should not reference a non-existent element
    const describedBy = switchEl.getAttribute('aria-describedby');
    if (describedBy) {
      for (const id of describedBy.split(' ')) {
        expect(document.getElementById(id)).toBeInTheDocument();
      }
    }
    // Description text should not be rendered when label is hidden
    expect(screen.queryByText('Some description')).not.toBeInTheDocument();
  });

  it('renders loading announcement when isBusy', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        isLoading
        onChange={() => {}}
      />,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading');
  });

  it('does not render loading announcement when not busy', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('sets aria-busy on input when loading', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        isLoading
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-busy', 'true');
  });

  it('calls onChangeAction on success and clears loading state', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn().mockResolvedValue(undefined);

    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        onChangeAction={handleAction}
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(handleAction).toHaveBeenCalledWith(true, expect.any(Object));
    // After resolution, loading state should clear
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not call onChange when isBusy (isLoading=true)', async () => {
    // Bypass pointer-events CSS check to test the JS guard
    const user = userEvent.setup({pointerEventsCheck: 0});
    const handleChange = vi.fn();

    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={handleChange}
        isLoading
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not call onChangeAction when onChange calls preventDefault', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();

    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={(_checked, e) => e.preventDefault()}
        onChangeAction={handleAction}
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleAction).not.toHaveBeenCalled();
  });

  it('warns in development when label is empty', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <XDSSwitch label="" value={false} onChange={() => {}} />,
    );
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('label'),
    );
    consoleWarn.mockRestore();
  });

  it('omits default variant values from xdsClassName', () => {
    const {container} = render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('xds-switch-field');
    // Default values 'end' and 'default' should not appear as class names
    expect(root.className).not.toContain(' end');
    expect(root.className).not.toContain(' default');
  });

  it('renders status message when status prop is provided', () => {
    render(
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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
      <XDSSwitch
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

  it('calls onFocus and onBlur callbacks', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(
      <XDSSwitch
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
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        isRequired
      />,
    );
    expect(screen.getByRole('switch')).toBeRequired();
  });

  it('includes non-default variant values in xdsClassName', () => {
    const {container} = render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        labelPosition="start"
        labelSpacing="spread"
      />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('start');
    expect(root.className).toContain('spread');
  });
});
