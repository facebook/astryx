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
    expect(description.className).toContain('srOnly');
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

  it('renders description without ID attribute when descriptionID is not provided', () => {
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

  it('renders Optional text with bullet separator', () => {
    render(
      <XDSField label="Name" inputID="name-input" isOptional>
        <input id="name-input" />
      </XDSField>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(
      screen.getByText('∙', {selector: '[aria-hidden="true"]'}),
    ).toBeInTheDocument();
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
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

  it('status has role="alert" and aria-live="assertive" for error type', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        status={{type: 'error', message: 'Invalid email'}}>
        <input id="email-input" />
      </XDSField>,
    );
    const status = screen.getByRole('alert');
    expect(status).toHaveTextContent('Invalid email');
    expect(status).toHaveAttribute('aria-live', 'assertive');
  });

  it('status has role="status" and aria-live="polite" for warning type', () => {
    render(
      <XDSField
        label="Email"
        inputID="email-input"
        status={{type: 'warning', message: 'Check this'}}>
        <input id="email-input" />
      </XDSField>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Check this');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('auto-generates description ID as {inputID}-desc when descriptionID is not provided', () => {
    render(
      <XDSField label="Email" inputID="my-input" description="Help text">
        <input id="my-input" />
      </XDSField>,
    );
    expect(screen.getByText('Help text')).toHaveAttribute(
      'id',
      'my-input-desc',
    );
  });

  it('auto-generates status message ID as {inputID}-status when messageID is not provided', () => {
    render(
      <XDSField
        label="Email"
        inputID="my-input"
        status={{type: 'error', message: 'Required'}}>
        <input id="my-input" />
      </XDSField>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'my-input-status');
  });

  it('warns when isOptional and isRequired are both set', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <XDSField label="Name" inputID="name-input" isOptional isRequired>
        <input id="name-input" />
      </XDSField>,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'XDSField: isOptional and isRequired are mutually exclusive. isOptional takes precedence.',
    );
    warnSpy.mockRestore();
  });
});
