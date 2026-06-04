// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSStepper} from './XDSStepper';
import {XDSStep} from './XDSStep';
import {XDSStepStatus} from './XDSStepStatus';

describe('XDSStepper', () => {
  it('renders a navigation landmark with steps', () => {
    render(
      <XDSStepper activeStep={0}>
        <XDSStep step={0} label="Step 1" />
        <XDSStep step={1} label="Step 2" />
        <XDSStep step={2} label="Step 3" />
      </XDSStepper>,
    );
    expect(
      screen.getByRole('navigation', {name: 'Progress'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(
      <XDSStepper activeStep={0}>
        <XDSStep step={0} label="First" indicator="number" />
        <XDSStep step={1} label="Second" indicator="number" />
      </XDSStepper>,
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('marks the active step with aria-current', () => {
    render(
      <XDSStepper activeStep={1}>
        <XDSStep step={0} label="Step 1" data-testid="step-0" />
        <XDSStep step={1} label="Step 2" data-testid="step-1" />
        <XDSStep step={2} label="Step 3" data-testid="step-2" />
      </XDSStepper>,
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
      <XDSStepper activeStep={0}>
        <XDSStep step={0} label="Account" description="Create your account" />
        <XDSStep step={1} label="Profile" />
      </XDSStepper>,
    );
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('supports custom accessible label', () => {
    render(
      <XDSStepper activeStep={0} label="Checkout progress">
        <XDSStep step={0} label="Cart" />
        <XDSStep step={1} label="Payment" />
      </XDSStepper>,
    );
    expect(
      screen.getByRole('navigation', {name: 'Checkout progress'}),
    ).toBeInTheDocument();
  });

  it('supports vertical orientation', () => {
    render(
      <XDSStepper activeStep={0} orientation="vertical">
        <XDSStep step={0} label="Step 1" />
        <XDSStep step={1} label="Step 2" />
      </XDSStepper>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('calls onStepClick when a completed step is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSStepper activeStep={2} onStepClick={handleClick}>
        <XDSStep step={0} label="Step 1" />
        <XDSStep step={1} label="Step 2" />
        <XDSStep step={2} label="Step 3" />
      </XDSStepper>,
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
      <XDSStepper activeStep={1} onStepClick={handleClick}>
        <XDSStep step={0} label="Step 1" />
        <XDSStep step={1} label="Step 2" />
        <XDSStep step={2} label="Step 3" />
      </XDSStepper>,
    );
    await user.click(
      screen.getByRole('button', {name: 'Go to step 2: Step 2'}),
    );
    expect(handleClick).toHaveBeenCalledWith(1);
  });

  it('renders buttons for upcoming steps in non-linear mode', () => {
    render(
      <XDSStepper activeStep={0} onStepClick={() => {}}>
        <XDSStep step={0} label="Step 1" />
        <XDSStep step={1} label="Step 2" />
      </XDSStepper>,
    );
    // All non-disabled steps are navigable, including not-started ones.
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
      <XDSStepper activeStep={0} onStepClick={handleClick}>
        <XDSStep step={0} label="Step 1" />
        <XDSStep step={1} label="Step 2" />
        <XDSStep step={2} label="Step 3" />
      </XDSStepper>,
    );
    await user.click(
      screen.getByRole('button', {name: 'Go to step 3: Step 3'}),
    );
    expect(handleClick).toHaveBeenCalledWith(2);
  });

  it('does not render buttons for disabled steps', () => {
    render(
      <XDSStepper activeStep={2} onStepClick={() => {}}>
        <XDSStep step={0} label="Step 1" isDisabled />
        <XDSStep step={1} label="Step 2" />
        <XDSStep step={2} label="Step 3" />
      </XDSStepper>,
    );
    expect(
      screen.queryByRole('button', {name: 'Go to step 1: Step 1'}),
    ).not.toBeInTheDocument();
  });

  it('does not render buttons when onStepClick is not provided', () => {
    render(
      <XDSStepper activeStep={2}>
        <XDSStep step={0} label="Step 1" />
        <XDSStep step={1} label="Step 2" />
        <XDSStep step={2} label="Step 3" />
      </XDSStepper>,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('supports status override', () => {
    render(
      <XDSStepper activeStep={0}>
        <XDSStep step={0} label="Step 1" data-testid="step-0" />
        <XDSStep
          step={1}
          label="Step 2"
          status={XDSStepStatus.Completed}
          data-testid="step-1"
        />
      </XDSStepper>,
    );
    const step1 = screen.getByTestId('step-1');
    expect(step1).toBeInTheDocument();
  });

  it('maps deprecated isCompleted prop to Completed status', () => {
    render(
      <XDSStepper activeStep={0}>
        <XDSStep step={0} label="Step 1" data-testid="step-0" />
        <XDSStep step={1} label="Step 2" isCompleted data-testid="step-1" />
      </XDSStepper>,
    );
    expect(screen.getByTestId('step-1').getAttribute('class') ?? '').toContain(
      'completed',
    );
  });

  it('maps deprecated hasError prop to Error status', () => {
    render(
      <XDSStepper activeStep={1}>
        <XDSStep step={0} label="Step 1" data-testid="step-0" />
        <XDSStep step={1} label="Step 2" hasError data-testid="step-1" />
      </XDSStepper>,
    );
    expect(screen.getByTestId('step-1').getAttribute('class') ?? '').toContain(
      'error',
    );
  });

  it('prioritizes explicit status over deprecated hasError', () => {
    render(
      <XDSStepper activeStep={0}>
        <XDSStep
          step={0}
          label="Step 1"
          hasError
          status={XDSStepStatus.Completed}
          data-testid="step-0"
        />
      </XDSStepper>,
    );
    const cls = screen.getByTestId('step-0').getAttribute('class') ?? '';
    expect(cls).toContain('completed');
    expect(cls).not.toContain('error');
  });

  it('handles zero active step correctly', () => {
    render(
      <XDSStepper activeStep={0}>
        <XDSStep step={0} label="Step 1" data-testid="step-0" />
        <XDSStep step={1} label="Step 2" data-testid="step-1" />
      </XDSStepper>,
    );
    expect(screen.getByTestId('step-0')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByTestId('step-1')).not.toHaveAttribute('aria-current');
  });

  it('renders listitem roles for each step', () => {
    render(
      <XDSStepper activeStep={0}>
        <XDSStep step={0} label="Step 1" />
        <XDSStep step={1} label="Step 2" />
        <XDSStep step={2} label="Step 3" />
      </XDSStepper>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
});
