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

  describe('description click forwarding', () => {
    // Renders a real control with the target id so click-forwarding has
    // something to hit, alongside the label whose description forwards clicks.
    function renderWithControl(props: {
      hasClickableDescription?: boolean;
      isGroupLabel?: boolean;
    }) {
      const onClick = vi.fn();
      render(
        <>
          <input id="ctrl" type="checkbox" onClick={onClick} />
          <FieldLabel
            label="Notify"
            inputID="ctrl"
            description="We'll email you"
            descriptionID="ctrl-desc"
            {...props}
          />
        </>,
      );
      return onClick;
    }

    it('forwards a description click to the control when hasClickableDescription is set', async () => {
      const user = userEvent.setup();
      const onClick = renderWithControl({hasClickableDescription: true});
      await user.click(screen.getByText("We'll email you"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does NOT forward description clicks by default (text-input path)', async () => {
      const user = userEvent.setup();
      const onClick = renderWithControl({});
      await user.click(screen.getByText("We'll email you"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does NOT forward description clicks for a group label', async () => {
      const user = userEvent.setup();
      const onClick = renderWithControl({
        hasClickableDescription: true,
        isGroupLabel: true,
      });
      await user.click(screen.getByText("We'll email you"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('keeps the description a sibling of the label (not nested inside it)', () => {
      renderWithControl({hasClickableDescription: true});
      const description = screen.getByText("We'll email you");
      // The description must not live inside the <label> — nesting it there
      // would fold it into the control's accessible name.
      expect(description.closest('label')).toBeNull();
    });
  });
});
