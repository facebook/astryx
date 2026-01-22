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
    expect(description).not.toHaveAttribute('id');
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
    expect(screen.getByText(/∙.*Optional/)).toBeInTheDocument();
  });
});
