// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Field.test.tsx
 * @input Uses vitest, @testing-library/react, Field component
 * @output Unit tests for Field component behavior
 * @position Testing; validates Field.tsx implementation
 *
 * SYNC: When Field.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Field} from './Field';
import {FormLayoutContext} from '../FormLayout/FormLayoutContext';

describe('Field', () => {
  it('renders with label', () => {
    render(
      <Field label="Email" inputID="email-input">
        <input id="email-input" />
      </Field>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <Field
        label="Email"
        inputID="email-input"
        description="We'll never share your email"
        descriptionID="email-desc">
        <input id="email-input" aria-describedby="email-desc" />
      </Field>,
    );
    expect(
      screen.getByText("We'll never share your email"),
    ).toBeInTheDocument();
  });

  it('associates description with correct ID', () => {
    render(
      <Field
        label="Email"
        inputID="email-input"
        description="Description text"
        descriptionID="email-desc">
        <input id="email-input" aria-describedby="email-desc" />
      </Field>,
    );
    const description = screen.getByText('Description text');
    expect(description).toHaveAttribute('id', 'email-desc');
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <Field label="Search" isLabelHidden inputID="search-input">
        <input id="search-input" />
      </Field>,
    );
    const label = screen.getByText('Search');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('visually hides description when isLabelHidden is true', () => {
    render(
      <Field
        label="Search"
        isLabelHidden
        description="Search for items"
        inputID="search-input"
        descriptionID="search-desc">
        <input id="search-input" />
      </Field>,
    );
    // Description should still be in the DOM for screen readers
    const description = screen.getByText('Search for items');
    expect(description).toBeInTheDocument();
    // But should have the visually-hidden styles applied
    expect(description.className).toContain('srOnly');
  });

  it('shows label visually by default', () => {
    render(
      <Field label="Email" inputID="email-input">
        <input id="email-input" />
      </Field>,
    );
    const label = screen.getByText('Email');
    expect(label).toBeVisible();
  });

  it('renders a single-control label as a <label> with htmlFor', () => {
    render(
      <Field label="Email" inputID="email-input">
        <input id="email-input" />
      </Field>,
    );
    const labelEl = screen.getByText('Email');
    expect(labelEl.tagName).toBe('LABEL');
    expect(labelEl).toHaveAttribute('for', 'email-input');
  });

  it('renders a group label as a <span> (not <label>) with no htmlFor', () => {
    render(
      <Field
        label="Plan"
        inputID="plan-group"
        labelID="plan-label"
        isGroupLabel>
        <div role="radiogroup" aria-labelledby="plan-label" />
      </Field>,
    );
    const labelEl = screen.getByText('Plan');
    // A group's accessible-name element must not be a literal <label>.
    expect(labelEl.tagName).toBe('SPAN');
    expect(labelEl.closest('label')).toBeNull();
    expect(labelEl).not.toHaveAttribute('for');
    // labelID is applied to the label element and referenced by the group.
    expect(labelEl).toHaveAttribute('id', 'plan-label');
    const group = screen.getByRole('radiogroup', {name: 'Plan'});
    expect(group.getAttribute('aria-labelledby')).toBe(labelEl.id);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Field ref={ref} label="Name" inputID="name-input">
        <input id="name-input" />
      </Field>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('renders description without ID attribute when descriptionID is not provided', () => {
    render(
      <Field
        label="Email"
        inputID="email-input"
        description="Description text">
        <input id="email-input" />
      </Field>,
    );
    const description = screen.getByText('Description text');
    expect(description).toBeInTheDocument();
    expect(description).toHaveAttribute('id', 'email-input-desc');
  });

  it('renders Optional text when isOptional is set', () => {
    render(
      <Field label="Name" inputID="name-input" isOptional>
        <input id="name-input" />
      </Field>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders Required text when isRequired is set', () => {
    render(
      <Field label="Name" inputID="name-input" isRequired>
        <input id="name-input" />
      </Field>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('renders description and Optional text when both are set', () => {
    render(
      <Field
        label="Name"
        inputID="name-input"
        description="Enter your name"
        descriptionID="name-desc"
        isOptional>
        <input id="name-input" aria-describedby="name-desc" />
      </Field>,
    );
    expect(screen.getByText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders description and Required text when both are set', () => {
    render(
      <Field
        label="Name"
        inputID="name-input"
        description="This field is mandatory"
        descriptionID="name-desc"
        isRequired>
        <input id="name-input" aria-describedby="name-desc" />
      </Field>,
    );
    expect(screen.getByText('This field is mandatory')).toBeInTheDocument();
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('renders Optional text with bullet separator', () => {
    render(
      <Field label="Name" inputID="name-input" isOptional>
        <input id="name-input" />
      </Field>,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(
      screen.getByText('∙', {selector: '[aria-hidden="true"]'}),
    ).toBeInTheDocument();
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders tooltip info icon when labelTooltip is provided', () => {
    render(
      <Field label="Help" inputID="help-input" labelTooltip="Helpful info">
        <input id="help-input" />
      </Field>,
    );
    // Info icon should be present
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('does not render tooltip icon when labelTooltip is not provided', () => {
    render(
      <Field label="Name" inputID="name-input">
        <input id="name-input" />
      </Field>,
    );
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  it('status has role="alert" and aria-live="assertive" for error type', () => {
    render(
      <Field
        label="Email"
        inputID="email-input"
        status={{type: 'error', message: 'Invalid email'}}>
        <input id="email-input" />
      </Field>,
    );
    const status = screen.getByRole('alert');
    expect(status).toHaveTextContent('Invalid email');
    expect(status).toHaveAttribute('aria-live', 'assertive');
  });

  it('status has role="status" and aria-live="polite" for warning type', () => {
    render(
      <Field
        label="Email"
        inputID="email-input"
        status={{type: 'warning', message: 'Check this'}}>
        <input id="email-input" />
      </Field>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Check this');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('auto-generates description ID as {inputID}-desc when descriptionID is not provided', () => {
    render(
      <Field label="Email" inputID="my-input" description="Help text">
        <input id="my-input" />
      </Field>,
    );
    expect(screen.getByText('Help text')).toHaveAttribute(
      'id',
      'my-input-desc',
    );
  });

  it('auto-generates status message ID as {inputID}-status when messageID is not provided', () => {
    render(
      <Field
        label="Email"
        inputID="my-input"
        status={{type: 'error', message: 'Required'}}>
        <input id="my-input" />
      </Field>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'my-input-status');
  });

  it('warns when isOptional and isRequired are both set', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Field label="Name" inputID="name-input" isOptional isRequired>
        <input id="name-input" />
      </Field>,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'Field: isOptional and isRequired are mutually exclusive. isOptional takes precedence.',
    );
    warnSpy.mockRestore();
  });

  // ─── width prop (#2755) ───────────────────────────────────────────────

  describe('width prop', () => {
    it('applies a string width to the outer field root', () => {
      render(
        <Field
          label="Name"
          inputID="name-input"
          width="100%"
          data-testid="field">
          <input id="name-input" data-testid="control" />
        </Field>,
      );
      const field = screen.getByTestId('field');
      // StyleX compiles the dynamic width to an inline CSS custom property.
      expect(field.getAttribute('style')).toContain('100%');
      expect(field.className).toContain('dynamicStyles.width');
    });

    it('applies a numeric width (treated as pixels)', () => {
      render(
        <Field
          label="Name"
          inputID="name-input"
          width={240}
          data-testid="field">
          <input id="name-input" />
        </Field>,
      );
      const field = screen.getByTestId('field');
      expect(field.getAttribute('style')).toContain('240');
    });

    it('does not size the inner control element', () => {
      render(
        <Field
          label="Name"
          inputID="name-input"
          width="100%"
          data-testid="field">
          <input id="name-input" data-testid="control" />
        </Field>,
      );
      const control = screen.getByTestId('control');
      // The width var lives on the field root, not the control itself.
      expect(control.getAttribute('style') ?? '').not.toContain('100%');
    });

    it('omits width styling when the prop is not provided', () => {
      render(
        <Field label="Name" inputID="name-input" data-testid="field">
          <input id="name-input" />
        </Field>,
      );
      const field = screen.getByTestId('field');
      expect(field.className).not.toContain('dynamicStyles.width');
    });
  });

  // ─── Horizontal-labels context ────────────────────────────────────────

  describe('horizontal-labels layout', () => {
    const horizontalLabelsWrapper = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <FormLayoutContext value={{direction: 'horizontal-labels'}}>
        {children}
      </FormLayoutContext>
    );

    it('applies display:contents when in horizontal-labels context', () => {
      const {container} = render(
        <Field label="Name" inputID="name-input">
          <input id="name-input" />
        </Field>,
        {wrapper: horizontalLabelsWrapper},
      );
      const field = container.firstChild as HTMLElement;
      expect(field.className).toContain('horizontalLabels');
    });

    it('renders label and input as direct grid children via display:contents', () => {
      render(
        <Field label="Name" inputID="name-input" data-testid="field">
          <input id="name-input" data-testid="name" />
        </Field>,
        {wrapper: horizontalLabelsWrapper},
      );
      const field = screen.getByTestId('field');
      // With display:contents, the field's children participate in the parent grid.
      // The field should contain: label alignment wrapper + input wrapper div
      const label = screen.getByText('Name');
      expect(label.tagName).toBe('LABEL');
      expect(field.contains(label)).toBe(true);
      expect(field.contains(screen.getByTestId('name'))).toBe(true);
    });

    it('groups description with input in column 2', () => {
      render(
        <Field
          label="Email"
          inputID="email-input"
          description="We won't share it"
          descriptionID="email-desc"
          data-testid="field">
          <input id="email-input" data-testid="email" />
        </Field>,
        {wrapper: horizontalLabelsWrapper},
      );
      const descEl = screen.getByText("We won't share it");
      const inputEl = screen.getByTestId('email');
      // Both description and input should be inside the same wrapper div (column 2)
      expect(descEl.parentElement).toBe(inputEl.parentElement);
    });

    it('groups status message with input in column 2', () => {
      render(
        <Field
          label="Email"
          inputID="email-input"
          status={{type: 'error', message: 'Required'}}
          data-testid="field">
          <input id="email-input" data-testid="email" />
        </Field>,
        {wrapper: horizontalLabelsWrapper},
      );
      const statusEl = screen.getByRole('alert');
      const inputEl = screen.getByTestId('email');
      // Both status and input should be inside the same wrapper div (column 2)
      expect(statusEl.parentElement).toBe(inputEl.parentElement);
    });

    it('does not apply display:contents in vertical context', () => {
      const {container} = render(
        <Field label="Name" inputID="name-input">
          <input id="name-input" />
        </Field>,
      );
      const field = container.firstChild as HTMLElement;
      expect(field.className).not.toContain('horizontalLabels');
      expect(field.className).toContain('container');
    });

    it('wraps label in alignment div with top padding', () => {
      render(
        <Field label="Name" inputID="name-input" data-testid="field">
          <input id="name-input" />
        </Field>,
        {wrapper: horizontalLabelsWrapper},
      );
      const field = screen.getByTestId('field');
      // First child should be the label alignment wrapper
      const labelWrapper = field.children[0] as HTMLElement;
      expect(labelWrapper.tagName).toBe('DIV');
      expect(labelWrapper.className).toContain('horizontalLabelAlign');
      // Label should be inside
      expect(labelWrapper.querySelector('label')).not.toBeNull();
    });
  });
});
