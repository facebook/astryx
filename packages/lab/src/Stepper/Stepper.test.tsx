// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Stepper} from './Stepper';
import {Step} from './Step';

describe('Stepper', () => {
  it('renders an ordered list of steps (not a nav landmark)', () => {
    render(
      <Stepper activeStep={0}>
        <Step step={0} label="Step 1" />
        <Step step={1} label="Step 2" />
        <Step step={2} label="Step 3" />
      </Stepper>,
    );
    // A stepper is a sequence/progress list, not a navigation landmark.
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    const list = screen.getByRole('list', {name: 'Progress'});
    expect(list.tagName).toBe('OL');
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(
      <Stepper activeStep={0}>
        <Step step={0} label="First" indicator="number" />
        <Step step={1} label="Second" indicator="number" />
      </Stepper>,
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('marks the active step with aria-current', () => {
    render(
      <Stepper activeStep={1}>
        <Step step={0} label="Step 1" data-testid="step-0" />
        <Step step={1} label="Step 2" data-testid="step-1" />
        <Step step={2} label="Step 3" data-testid="step-2" />
      </Stepper>,
    );
    expect(screen.getByTestId('step-0')).not.toHaveAttribute('aria-current');
    expect(screen.getByTestId('step-1')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByTestId('step-2')).not.toHaveAttribute('aria-current');
  });

  it('renders descriptions when provided', () => {
    render(
      <Stepper activeStep={0}>
        <Step step={0} label="Account" description="Create your account" />
        <Step step={1} label="Profile" />
      </Stepper>,
    );
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('supports custom accessible label', () => {
    render(
      <Stepper activeStep={0} label="Checkout progress">
        <Step step={0} label="Cart" />
        <Step step={1} label="Payment" />
      </Stepper>,
    );
    expect(
      screen.getByRole('list', {name: 'Checkout progress'}),
    ).toBeInTheDocument();
  });

  it('supports vertical orientation', () => {
    render(
      <Stepper activeStep={0} orientation="vertical">
        <Step step={0} label="Step 1" />
        <Step step={1} label="Step 2" />
      </Stepper>,
    );
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('data-orientation', 'vertical');
  });

  it('calls onStepClick when a completed step is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Stepper activeStep={2} onStepClick={handleClick}>
        <Step step={0} label="Step 1" />
        <Step step={1} label="Step 2" />
        <Step step={2} label="Step 3" />
      </Stepper>,
    );
    await user.click(
      screen.getByRole('button', {name: 'Go to step 1: Step 1'}),
    );
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('calls onStepClick when the active step is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Stepper activeStep={1} onStepClick={handleClick}>
        <Step step={0} label="Step 1" />
        <Step step={1} label="Step 2" />
        <Step step={2} label="Step 3" />
      </Stepper>,
    );
    await user.click(
      screen.getByRole('button', {name: 'Go to step 2: Step 2'}),
    );
    expect(handleClick).toHaveBeenCalledWith(1);
  });

  it('renders buttons for upcoming steps in non-linear mode', () => {
    render(
      <Stepper activeStep={0} onStepClick={() => {}}>
        <Step step={0} label="Step 1" />
        <Step step={1} label="Step 2" />
      </Stepper>,
    );
    expect(
      screen.getByRole('button', {name: 'Go to step 1: Step 1'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to step 2: Step 2'}),
    ).toBeInTheDocument();
  });

  it('calls onStepClick when an upcoming step is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Stepper activeStep={0} onStepClick={handleClick}>
        <Step step={0} label="Step 1" />
        <Step step={1} label="Step 2" />
        <Step step={2} label="Step 3" />
      </Stepper>,
    );
    await user.click(
      screen.getByRole('button', {name: 'Go to step 3: Step 3'}),
    );
    expect(handleClick).toHaveBeenCalledWith(2);
  });

  it('does not render buttons for disabled steps', () => {
    render(
      <Stepper activeStep={2} onStepClick={() => {}}>
        <Step step={0} label="Step 1" isDisabled />
        <Step step={1} label="Step 2" />
        <Step step={2} label="Step 3" />
      </Stepper>,
    );
    expect(
      screen.queryByRole('button', {name: 'Go to step 1: Step 1'}),
    ).not.toBeInTheDocument();
  });

  it('does not render buttons when onStepClick is not provided', () => {
    render(
      <Stepper activeStep={2}>
        <Step step={0} label="Step 1" />
        <Step step={1} label="Step 2" />
        <Step step={2} label="Step 3" />
      </Stepper>,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('applies a semantic color status (color only) via data attribute', () => {
    render(
      <Stepper activeStep={1}>
        <Step step={0} label="Step 1" data-testid="step-0" />
        <Step step={1} label="Step 2" status="error" data-testid="step-1" />
      </Stepper>,
    );
    expect(screen.getByTestId('step-1')).toHaveAttribute(
      'data-status',
      'error',
    );
    // status is color-only — it must not change progress semantics.
    expect(screen.getByTestId('step-1')).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('reflects each global semantic status on the data attribute', () => {
    render(
      <Stepper activeStep={0}>
        <Step step={0} label="A" status="accent" data-testid="s-accent" />
        <Step step={1} label="B" status="success" data-testid="s-success" />
        <Step step={2} label="C" status="warning" data-testid="s-warning" />
        <Step step={3} label="D" status="error" data-testid="s-error" />
      </Stepper>,
    );
    expect(screen.getByTestId('s-accent')).toHaveAttribute(
      'data-status',
      'accent',
    );
    expect(screen.getByTestId('s-success')).toHaveAttribute(
      'data-status',
      'success',
    );
    expect(screen.getByTestId('s-warning')).toHaveAttribute(
      'data-status',
      'warning',
    );
    expect(screen.getByTestId('s-error')).toHaveAttribute(
      'data-status',
      'error',
    );
  });

  it('keeps the progress bar progress-colored regardless of status, recoloring only the indicator', () => {
    // Baseline: a completed step with no status.
    const baseline = render(
      <Stepper activeStep={1}>
        <Step step={0} label="A" data-testid="base" />
      </Stepper>,
    );
    const baseStep = baseline.getByTestId('base');
    const baseBar = baseStep.querySelector('.astryx-step-bar') as HTMLElement;
    const baseIndicator = baseStep.querySelector('svg')
      ?.parentElement as HTMLElement;

    // Same completed step, now with a semantic status.
    const themed = render(
      <Stepper activeStep={1}>
        <Step step={0} label="A" status="error" data-testid="themed" />
      </Stepper>,
    );
    const themedStep = themed.getByTestId('themed');
    const themedBar = themedStep.querySelector(
      '.astryx-step-bar',
    ) as HTMLElement;
    const themedIndicator = themedStep.querySelector('svg')
      ?.parentElement as HTMLElement;

    // Bar coloring must be identical — status must NOT recolor the bar
    // (always --color-accent when filled / --color-border when incomplete).
    expect(themedBar.className).toBe(baseBar.className);

    // The indicator, however, must pick up the status color.
    expect(themedIndicator.className).not.toBe(baseIndicator.className);
  });

  it('keeps an incomplete step bar border-colored regardless of status', () => {
    // Baseline: a not-started step with no status.
    const baseline = render(
      <Stepper activeStep={0}>
        <Step step={0} label="A" data-testid="base-active" />
        <Step step={1} label="B" data-testid="base" />
      </Stepper>,
    );
    const baseBar = baseline
      .getByTestId('base')
      .querySelector('.astryx-step-bar') as HTMLElement;

    // Same not-started step, now with a semantic status.
    const themed = render(
      <Stepper activeStep={0}>
        <Step step={0} label="A" data-testid="themed-active" />
        <Step step={1} label="B" status="warning" data-testid="themed" />
      </Stepper>,
    );
    const themedBar = themed
      .getByTestId('themed')
      .querySelector('.astryx-step-bar') as HTMLElement;

    // Incomplete bar stays border-colored — status must not recolor it.
    expect(themedBar.className).toBe(baseBar.className);
  });

  it('does not set a status data attribute when status is unset', () => {
    render(
      <Stepper activeStep={0}>
        <Step step={0} label="Step 1" data-testid="step-0" />
      </Stepper>,
    );
    expect(screen.getByTestId('step-0')).not.toHaveAttribute('data-status');
  });

  it('handles zero active step correctly', () => {
    render(
      <Stepper activeStep={0}>
        <Step step={0} label="Step 1" data-testid="step-0" />
        <Step step={1} label="Step 2" data-testid="step-1" />
      </Stepper>,
    );
    expect(screen.getByTestId('step-0')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByTestId('step-1')).not.toHaveAttribute('aria-current');
  });

  it('renders each step as a list item', () => {
    render(
      <Stepper activeStep={0}>
        <Step step={0} label="Step 1" />
        <Step step={1} label="Step 2" />
        <Step step={2} label="Step 3" />
      </Stepper>,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0].tagName).toBe('LI');
  });

  it('accepts a custom ReactNode as indicator', () => {
    render(
      <Stepper activeStep={0}>
        <Step
          step={0}
          label="Step 1"
          indicator={<span data-testid="custom-icon">★</span>}
        />
      </Stepper>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('accepts a generic icon via the icon prop', () => {
    render(
      <Stepper activeStep={1}>
        <Step
          step={1}
          label="Payment"
          icon={<span data-testid="pay-icon">$</span>}
        />
      </Stepper>,
    );
    expect(screen.getByTestId('pay-icon')).toBeInTheDocument();
  });

  it('renders a distinct indicator glyph per status on non-current steps', () => {
    // All steps completed (activeStep past them) so none is the current step.
    render(
      <Stepper activeStep={4}>
        <Step step={0} label="A" status="success" data-testid="s-success" />
        <Step step={1} label="B" status="warning" data-testid="s-warning" />
        <Step step={2} label="C" status="error" data-testid="s-error" />
        <Step step={3} label="D" data-testid="s-plain" />
      </Stepper>,
    );

    const indicatorClass = (testid: string) =>
      (
        screen.getByTestId(testid).querySelector('svg')
          ?.parentElement as HTMLElement
      ).className;

    // Each status renders an svg indicator (no number badge)...
    expect(screen.getByTestId('s-success').querySelector('svg')).toBeTruthy();
    expect(screen.getByTestId('s-warning').querySelector('svg')).toBeTruthy();
    expect(screen.getByTestId('s-error').querySelector('svg')).toBeTruthy();

    // ...and each status tints the indicator differently from the others and
    // from the plain completed (accent) step.
    const classes = new Set([
      indicatorClass('s-success'),
      indicatorClass('s-warning'),
      indicatorClass('s-error'),
      indicatorClass('s-plain'),
    ]);
    expect(classes.size).toBe(4);
  });

  it('lets the current step keep its ring indicator regardless of status', () => {
    // A current step with no status.
    const plain = render(
      <Stepper activeStep={0}>
        <Step step={0} label="A" data-testid="plain" />
      </Stepper>,
    );
    const plainIndicator = (
      plain.getByTestId('plain').querySelector('svg')
        ?.parentElement as HTMLElement
    ).className;

    // The same current step, now with status="success": the indicator must be
    // unchanged (the current-step ring replaces any status glyph).
    const themed = render(
      <Stepper activeStep={0}>
        <Step step={0} label="A" status="success" data-testid="themed" />
      </Stepper>,
    );
    const themedIndicator = (
      themed.getByTestId('themed').querySelector('svg')
        ?.parentElement as HTMLElement
    ).className;

    expect(themedIndicator).toBe(plainIndicator);
  });

  it('replaces the number badge with a status glyph on not-started steps', () => {
    render(
      <Stepper activeStep={0}>
        <Step step={0} label="A" data-testid="current" />
        <Step step={1} label="B" status="error" data-testid="future" />
      </Stepper>,
    );
    const future = screen.getByTestId('future');
    // The not-started step would normally show its number ("2"); with a status
    // glyph it shows an icon instead.
    expect(future.textContent).not.toContain('2');
    expect(future.querySelector('svg')).toBeTruthy();
  });
});
