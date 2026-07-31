// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FieldLabel.test.tsx
 * @input Uses vitest, @testing-library/react, FieldLabel component
 * @output Unit tests for FieldLabel component behavior
 * @position Testing; validates FieldLabel.tsx implementation
 *
 * SYNC: When FieldLabel.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {TestIcon} from '../__tests__/TestIcon';
import {InternationalizationProvider} from '../i18n';
import {FieldLabel} from './FieldLabel';

describe('FieldLabel', () => {
  it('renders label text', () => {
    render(<FieldLabel label="Email" inputID="email-input" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(<FieldLabel label="Email" inputID="email-input" />);
    const label = screen.getByText('Email').closest('label');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('renders Optional text when isOptional is true', () => {
    render(<FieldLabel label="Name" inputID="name-input" isOptional />);
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders Required text when isRequired is true', () => {
    render(<FieldLabel label="Name" inputID="name-input" isRequired />);
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('localizes the required indicator via the i18n provider', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{fr: {'@astryx.field.required': 'Obligatoire'}}}>
        <FieldLabel label="Nom" inputID="name-input" isRequired />
      </InternationalizationProvider>,
    );
    expect(screen.getByText(/Obligatoire/)).toBeInTheDocument();
    expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
  });

  it('localizes the optional indicator via the i18n provider', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{fr: {'@astryx.field.optional': 'Facultatif'}}}>
        <FieldLabel label="Nom" inputID="name-input" isOptional />
      </InternationalizationProvider>,
    );
    expect(screen.getByText(/Facultatif/)).toBeInTheDocument();
    expect(screen.queryByText(/Optional/)).not.toBeInTheDocument();
  });

  it('shows Optional when both isOptional and isRequired are true', () => {
    render(
      <FieldLabel label="Name" inputID="name-input" isOptional isRequired />,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
    expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
  });

  it('renders labelIcon when provided', () => {
    render(
      <FieldLabel
        label="Starred"
        inputID="starred-input"
        labelIcon={TestIcon}
      />,
    );
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<FieldLabel ref={ref} label="Name" inputID="name-input" />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLLabelElement));
  });

  it('renders tooltip info icon when labelTooltip prop is provided', () => {
    render(
      <FieldLabel
        label="Help"
        inputID="help-input"
        labelTooltip="This is helpful information"
      />,
    );
    // Two SVGs: the info icon is wrapped in tooltip
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('does not render extra icon when labelTooltip is not provided', () => {
    render(<FieldLabel label="Name" inputID="name-input" />);
    // No SVGs should be present when no icons are provided
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders labelTooltip with Optional indicator together', () => {
    render(
      <FieldLabel
        label="Field"
        inputID="field-input"
        isOptional
        labelTooltip="Help text"
      />,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
    // Info icon should be present
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('nests the description inside the label for a single control', () => {
    render(
      <FieldLabel
        label="Send email updates"
        inputID="updates-input"
        description="We will only email you about your account"
      />,
    );
    const label = screen.getByText('Send email updates').closest('label');
    const description = screen.getByText(
      'We will only email you about your account',
    );
    expect(label).toContainElement(description);
  });

  it('keeps the description outside the label when isGroupLabel is true', () => {
    render(
      <FieldLabel
        label="Notification channel"
        inputID="channel-input"
        isGroupLabel
        description="Choose where you want to be notified"
      />,
    );
    const label = screen.getByText('Notification channel').closest('span');
    const description = screen.getByText(
      'Choose where you want to be notified',
    );
    expect(label).not.toContainElement(description);
  });

  it('toggles the associated checkbox when the description is clicked', async () => {
    const user = userEvent.setup();
    function Example() {
      const [checked, setChecked] = useState(false);
      return (
        <>
          <input
            type="checkbox"
            id="terms-input"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
          />
          <FieldLabel
            label="I agree to the terms"
            inputID="terms-input"
            description="Read the full terms before continuing"
          />
        </>
      );
    }
    render(<Example />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByText('Read the full terms before continuing'));
    expect(checkbox).toBeChecked();
  });

  it('does not toggle the checkbox when a link inside the description is clicked', async () => {
    const user = userEvent.setup();
    const handleLinkClick = vi.fn((e: React.MouseEvent<HTMLAnchorElement>) =>
      e.preventDefault(),
    );
    function Example() {
      const [checked, setChecked] = useState(false);
      return (
        <>
          <input
            type="checkbox"
            id="terms-link-input"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
          />
          <FieldLabel
            label="I agree to the terms"
            inputID="terms-link-input"
            description={
              <>
                Read the{' '}
                <a href="/terms" onClick={handleLinkClick}>
                  terms
                </a>{' '}
                before continuing
              </>
            }
          />
        </>
      );
    }
    render(<Example />);
    const checkbox = screen.getByRole('checkbox');
    await user.click(screen.getByRole('link', {name: 'terms'}));
    expect(handleLinkClick).toHaveBeenCalledOnce();
    expect(checkbox).not.toBeChecked();
  });
});
