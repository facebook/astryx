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
import {FieldProvider} from './FieldProvider';

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
      isGroupLabel?: boolean;
      controlType?: string;
      description?: React.ReactNode;
    }) {
      const {isGroupLabel, controlType = 'checkbox', description} = props;
      const onClick = vi.fn();
      render(
        <>
          <input id="ctrl" type={controlType} onClick={onClick} />
          <FieldLabel
            label="Notify"
            inputID="ctrl"
            description={description ?? "We'll email you"}
            descriptionID="ctrl-desc"
            isGroupLabel={isGroupLabel}
          />
        </>,
      );
      return onClick;
    }

    it('forwards a description click to a click-activatable control (checkbox)', async () => {
      const user = userEvent.setup();
      const onClick = renderWithControl({controlType: 'checkbox'});
      await user.click(screen.getByText("We'll email you"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('focuses (does not click) a text input on description click', async () => {
      const user = userEvent.setup();
      const onClick = renderWithControl({controlType: 'text'});
      await user.click(screen.getByText("We'll email you"));
      // Text inputs focus rather than click — matching native label behavior,
      // so no synthetic click fires but the control receives focus.
      expect(onClick).not.toHaveBeenCalled();
      expect(document.getElementById('ctrl')).toHaveFocus();
    });

    it('does NOT forward description clicks for a group label', async () => {
      const user = userEvent.setup();
      const onClick = renderWithControl({isGroupLabel: true});
      await user.click(screen.getByText("We'll email you"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does NOT hijack clicks on interactive content inside the description', async () => {
      const user = userEvent.setup();
      const linkClick = vi.fn();
      const onClick = renderWithControl({
        description: (
          <>
            See our{' '}
            <a href="#terms" onClick={linkClick}>
              terms
            </a>
          </>
        ),
      });
      await user.click(screen.getByRole('link', {name: 'terms'}));
      // The nested link handles its own click; the control is not toggled.
      expect(linkClick).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('keeps the description a sibling of the label (not nested inside it)', () => {
      renderWithControl({});
      const description = screen.getByText("We'll email you");
      // The description must not live inside the <label> — nesting it there
      // would fold it into the control's accessible name.
      expect(description.closest('label')).toBeNull();
    });
  });
});

describe('FieldLabel indicator modes', () => {
  it('defaults to the "Required" / "Optional" text', () => {
    const {rerender} = render(
      <FieldLabel label="Name" inputID="i" isRequired />,
    );
    expect(screen.getByText(/Required/)).toBeInTheDocument();
    rerender(<FieldLabel label="Name" inputID="i" isOptional />);
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders a red asterisk and keeps "Required" for screen readers', () => {
    const {container} = render(
      <FieldLabel
        label="Name"
        inputID="i"
        isRequired
        requiredIndicator="asterisk"
      />,
    );
    // Visible asterisk, hidden from AT.
    const asterisk = screen.getByText('*', {exact: false, selector: 'span'});
    expect(asterisk).toHaveAttribute('aria-hidden', 'true');
    // The word is still present (sr-only) so the accessible name conveys it.
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(container.textContent).toContain('*');
  });

  it('renders nothing visible in "none" mode', () => {
    render(
      <FieldLabel
        label="Name"
        inputID="i"
        isRequired
        requiredIndicator="none"
      />,
    );
    expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('applies optionalIndicator="none" to hide the Optional text', () => {
    render(
      <FieldLabel
        label="Name"
        inputID="i"
        isOptional
        optionalIndicator="none"
      />,
    );
    expect(screen.queryByText(/Optional/)).not.toBeInTheDocument();
  });

  it('never renders an asterisk for an optional field', () => {
    // OptionalIndicator has no asterisk mode; a required-style asterisk prop is
    // ignored when the field is optional.
    render(
      <FieldLabel
        label="Name"
        inputID="i"
        isOptional
        requiredIndicator="asterisk"
      />,
    );
    expect(screen.queryByText('*')).not.toBeInTheDocument();
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });
});

describe('FieldProvider', () => {
  it('sets the default indicator mode for fields in the subtree', () => {
    render(
      <FieldProvider requiredIndicator="none" optionalIndicator="text">
        <FieldLabel label="A" inputID="a" isRequired />
        <FieldLabel label="B" inputID="b" isOptional />
      </FieldProvider>,
    );
    // Required is hidden; optional still shows its word.
    expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('lets a per-field prop override the provider', () => {
    render(
      <FieldProvider requiredIndicator="none">
        <FieldLabel
          label="A"
          inputID="a"
          isRequired
          requiredIndicator="asterisk"
        />
      </FieldProvider>,
    );
    expect(screen.getByText('*', {selector: 'span'})).toBeInTheDocument();
  });

  it('falls back to text when no provider and no prop', () => {
    render(<FieldLabel label="A" inputID="a" isRequired />);
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });
});
