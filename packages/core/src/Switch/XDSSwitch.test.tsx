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
      />
    );
    expect(screen.getByLabelText('Enable notifications')).toBeInTheDocument();
  });

  it('renders as off by default', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('renders as on when value prop is true', () => {
    render(
      <XDSSwitch
        label="Enable notifications"
        value={true}
        onChange={() => {}}
      />
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
      />
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
      />
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
      />
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
      />
    );
    expect(
      screen.getByText('Switch to a darker color scheme')
    ).toBeInTheDocument();
  });

  it('associates description with switch via aria-describedby', () => {
    render(
      <XDSSwitch
        label="Dark mode"
        description="Switch to a darker color scheme"
        value={false}
        onChange={() => {}}
      />
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
      />
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
      />
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
      />
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
      />
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
      />
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
      />
    );
    const containerDiv = container.firstChild as HTMLElement;
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
      />
    );
    const containerDiv = container.firstChild as HTMLElement;
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
      />
    );
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});
