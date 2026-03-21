/**
 * @file XDSField.test.tsx
 * @input Uses vitest, @testing-library/react, XDSField component
 * @output Unit tests for XDSField component behavior
 * @position Testing; validates XDSField.tsx implementation
 *
 * SYNC: When XDSField.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSField} from './XDSField';
import {XDSFieldStatus} from './XDSFieldStatus';

describe('XDSField', () => {
  it('renders with label', () => {
    render(
      <XDSField label="Email" inputID="email-input">
        <input id="email-input" />
      </XDSField>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        description="We'll never share your email"
        descriptionID="email-desc">
        <input id="email-input" aria-describedby="email-desc" />
      </XDSField>,
    );
    expect(
      screen.getByText("We'll never share your email"),
    ).toBeInTheDocument();
  });

  it('associates description with correct ID', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        description="Description text"
        descriptionID="email-desc">
        <input id="email-input" aria-describedby="email-desc" />
      </XDSField>,
    );
    const description = screen.getByText('Description text');
    expect(description).toHaveAttribute('id', 'email-desc');
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <XDSField label="Search" isLabelHidden inputID="search-input">
        <input id="search-input" />
      </XDSField>,
    );
    const label = screen.getByText('Search');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('visually hides description when isLabelHidden is true', () => {
    render(
      <XDSField
        label="Search"
        isLabelHidden
        description="Search for items"
        inputID="search-input"
        descriptionID="search-desc">
        <input id="search-input" />
      </XDSField>,
    );
    // Description should still be in the DOM for screen readers
    const description = screen.getByText('Search for items');
    expect(description).toBeInTheDocument();
    // But should have the visually-hidden styles applied
    expect(description.className).toContain('labelHidden');
  });

  it('shows label visually by default', () => {
    render(
      <XDSField label="Email" inputID="email-input">
        <input id="email-input" />
      </XDSField>,
    );
    const label = screen.getByText('Email');
    expect(label).toBeVisible();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSField ref={ref} label="Name" inputID="name-input">
        <input id="name-input" />
      </XDSField>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('auto-generates descriptionID when description is provided but descriptionID is omitted', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        description="Description text">
        <input id="email-input" />
      </XDSField>,
    );
    const description = screen.getByText('Description text');
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('id', 'email-input-desc');
  });

  it('renders Optional text when isOptional is set', () => {
    render(
      <XDSField label="Name" inputID="name-input" isOptional>
        <input id="name-input" />
      </XDSField>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders Required text when isRequired is set', () => {
    render(
      <XDSField label="Name" inputID="name-input" isRequired>
        <input id="name-input" />
      </XDSField>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('renders description and Optional text when both are set', () => {
    render(
      <XDSField
        label="Name"
        inputID="name-input"
        description="Enter your name"
        descriptionID="name-desc"
        isOptional>
        <input id="name-input" aria-describedby="name-desc" />
      </XDSField>,
    );
    expect(screen.getByText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders description and Required text when both are set', () => {
    render(
      <XDSField
        label="Name"
        inputID="name-input"
        description="This field is mandatory"
        descriptionID="name-desc"
        isRequired>
        <input id="name-input" aria-describedby="name-desc" />
      </XDSField>,
    );
    expect(screen.getByText('This field is mandatory')).toBeInTheDocument();
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('renders Optional text with bullet separator hidden from screen readers', () => {
    render(
      <XDSField label="Name" inputID="name-input" isOptional>
        <input id="name-input" />
      </XDSField>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
    const bullet = screen.getByText('∙', {exact: false});
    expect(bullet).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders tooltip info icon when labelTooltip is provided', () => {
    render(
      <XDSField label="Help" inputID="help-input" labelTooltip="Helpful info">
        <input id="help-input" />
      </XDSField>,
    );
    // Info icon should be present
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render tooltip icon when labelTooltip is not provided', () => {
    render(
      <XDSField label="Name" inputID="name-input">
        <input id="name-input" />
      </XDSField>,
    );
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders attached status variant by default', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        status={{type: 'error', message: 'Invalid email'}}>
        <input id="email-input" />
      </XDSField>,
    );
    const status = screen.getByText('Invalid email');
    expect(status).toBeInTheDocument();
    expect(status.className).toContain('attached');
  });

  it('does not render status when message is absent', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        status={{type: 'error'}}>
        <input id="email-input" />
      </XDSField>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders status with messageID for aria-describedby', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        status={{
          type: 'error',
          message: 'Required field',
          messageID: 'email-error',
        }}>
        <input id="email-input" aria-describedby="email-error" />
      </XDSField>,
    );
    const status = screen.getByText('Required field');
    expect(status).toHaveAttribute('id', 'email-error');
  });

  it('auto-generates messageID when status.message is provided but messageID is omitted', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        status={{type: 'error', message: 'Required field'}}>
        <input id="email-input" />
      </XDSField>,
    );
    const status = screen.getByText('Required field');
    expect(status).toHaveAttribute('id', 'email-input-status');
  });

  it('renders detached status variant', () => {
    render(
      <XDSField
        label="Toggle"
        inputID="toggle-input"
        statusVariant="detached"
        status={{type: 'error', message: 'Something went wrong'}}>
        <input id="toggle-input" />
      </XDSField>,
    );
    const status = screen.getByText('Something went wrong');
    expect(status).toBeInTheDocument();
    expect(status.className).toContain('detached');
  });

  it('does not accept isDisabled prop (disabled state detected via CSS :has(:disabled))', () => {
    render(
      <XDSField label="Disabled field" inputID="dis-input">
        <input id="dis-input" disabled />
      </XDSField>,
    );
    // Label is rendered without a disabled prop — styling is handled via
    // CSS ancestor detection (:has(:disabled)) on the container
    const label = screen.getByText('Disabled field').closest('label');
    expect(label).toBeInTheDocument();
    // The label should NOT have the prop-based labelDisabled class
    expect(label?.className).not.toContain('labelDisabled');
  });

  it('warns when both isOptional and isRequired are set', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <XDSField label="Conflict" inputID="conflict-input" isOptional isRequired>
        <input id="conflict-input" />
      </XDSField>,
    );
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('isOptional and isRequired are mutually exclusive'),
    );
    spy.mockRestore();
  });

  it('shows Optional when both isOptional and isRequired are set', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <XDSField label="Both" inputID="both-input" isOptional isRequired>
        <input id="both-input" />
      </XDSField>,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
    expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });
});

describe('XDSFieldStatus', () => {
  it('uses role="alert" and aria-live="assertive" for errors', () => {
    render(<XDSFieldStatus type="error" message="Error occurred" />);
    const status = screen.getByRole('alert');
    expect(status).toHaveAttribute('aria-live', 'assertive');
    expect(status).toHaveTextContent('Error occurred');
  });

  it('uses role="status" and aria-live="polite" for non-error types', () => {
    render(<XDSFieldStatus type="warning" message="Watch out" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');

    const {rerender} = render(
      <XDSFieldStatus type="success" message="All good" />,
    );
    expect(screen.getAllByRole('status')[0]).toHaveAttribute(
      'aria-live',
      'polite',
    );
  });

  it('renders detached variant with correct class', () => {
    render(
      <XDSFieldStatus type="warning" message="Watch out" variant="detached" />,
    );
    const status = screen.getByRole('status');
    expect(status.className).toContain('detached');
    expect(status.className).not.toContain('attached');
  });

  it('renders attached variant by default', () => {
    render(<XDSFieldStatus type="success" message="All good" />);
    const status = screen.getByRole('status');
    expect(status.className).toContain('attached');
  });

  it('applies correct color style for each status type', () => {
    const {rerender} = render(
      <XDSFieldStatus type="error" message="Error" />,
    );
    expect(screen.getByRole('alert').className).toContain('error');

    rerender(<XDSFieldStatus type="warning" message="Warning" />);
    expect(screen.getByRole('status').className).toContain('warning');

    rerender(<XDSFieldStatus type="success" message="Success" />);
    expect(screen.getByRole('status').className).toContain('success');
  });

  it('renders with id when provided', () => {
    render(
      <XDSFieldStatus type="error" message="Error" id="status-id" />,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'status-id');
  });

  it('does not have id attribute when not provided', () => {
    render(<XDSFieldStatus type="error" message="Error" />);
    expect(screen.getByRole('alert')).not.toHaveAttribute('id');
  });
});
