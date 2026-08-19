// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
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
      screen.getByRole('button', {name: 'Go to step 1: Step 1, completed'}),
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
      screen.queryByRole('button', {name: /Go to step 1: Step 1/}),
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
    // The current-step ring's painted color is driven by the StyleX
    // `iconInProgress` class (accent), never a status color — the ring replaces
    // any status glyph. The `astryx-step-indicator` theme target reflects
    // `status` as a data attribute so a theme can still reach it, which is
    // orthogonal to the painted color, so assert the StyleX color class here.
    const stylexColorClasses = (el: HTMLElement) =>
      el.className
        .split(/\s+/)
        // Keep StyleX classes (debug `Step__styles.*` names + `x*` atomic
        // hashes); drop the themeProps data reflections (`in-progress`,
        // `success`, `astryx-*`) which are orthogonal to the painted color.
        .filter(c => c.startsWith('Step__styles.') || /^x[a-z0-9]+$/.test(c))
        .sort()
        .join(' ');

    const plain = render(
      <Stepper activeStep={0}>
        <Step step={0} label="A" data-testid="plain" />
      </Stepper>,
    );
    const plainIndicator = stylexColorClasses(
      plain.getByTestId('plain').querySelector('svg')
        ?.parentElement as HTMLElement,
    );

    // The same current step, now with status="success": the painted ring must
    // be unchanged (the current-step ring replaces any status glyph).
    const themed = render(
      <Stepper activeStep={0}>
        <Step step={0} label="A" status="success" data-testid="themed" />
      </Stepper>,
    );
    const themedIndicator = stylexColorClasses(
      themed.getByTestId('themed').querySelector('svg')
        ?.parentElement as HTMLElement,
    );

    expect(themedIndicator).toBe(plainIndicator);
    // And it is the in-progress (accent) color, not a status color.
    expect(plainIndicator).toContain('Step__styles.iconInProgress');
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

  it('exposes progress/status as visually hidden text (indicators are aria-hidden)', () => {
    render(
      <Stepper activeStep={2}>
        <Step step={0} label="Account" data-testid="done" />
        <Step step={1} label="Payment" status="error" data-testid="failed" />
        <Step step={2} label="Review" data-testid="current" />
        <Step step={3} label="Confirm" data-testid="upcoming" />
      </Stepper>,
    );
    // Completed step announces "completed"; error status wins over completion.
    expect(
      within(screen.getByTestId('done')).getByText('completed'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('failed')).getByText('error'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('failed')).queryByText('completed'),
    ).not.toBeInTheDocument();
    // Current step is announced via aria-current, not hidden text; upcoming
    // steps stay silent.
    expect(
      within(screen.getByTestId('current')).queryByText('completed'),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('upcoming')).queryByText(
        /completed|error|warning/,
      ),
    ).not.toBeInTheDocument();
  });

  it('exposes warning and success statuses as visually hidden text', () => {
    render(
      <Stepper activeStep={2}>
        <Step step={0} label="Build" status="warning" data-testid="warned" />
        <Step step={1} label="Deploy" status="success" data-testid="passed" />
      </Stepper>,
    );
    expect(
      within(screen.getByTestId('warned')).getByText('warning'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('passed')).getByText('completed'),
    ).toBeInTheDocument();
  });

  it('composes status into the accessible name of clickable steps', () => {
    render(
      <Stepper activeStep={2} onStepClick={() => {}}>
        <Step step={0} label="Account" />
        <Step step={1} label="Payment" status="error" />
        <Step step={2} label="Review" />
      </Stepper>,
    );
    expect(
      screen.getByRole('button', {name: 'Go to step 1: Account, completed'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Go to step 2: Payment, error'}),
    ).toBeInTheDocument();
    // The current step gets no status suffix (aria-current covers it).
    expect(
      screen.getByRole('button', {name: 'Go to step 3: Review'}),
    ).toBeInTheDocument();
  });

  it('exposes hidden status text in the on-track layout too', () => {
    render(
      <Stepper activeStep={1} indicatorPosition="on-track">
        <Step step={0} label="Account" data-testid="ot-done" />
        <Step step={1} label="Payment" data-testid="ot-current" />
      </Stepper>,
    );
    expect(
      within(screen.getByTestId('ot-done')).getByText('completed'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('ot-current')).queryByText('completed'),
    ).not.toBeInTheDocument();
  });

  describe('keyboard interaction', () => {
    it('activates a step with Enter', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Stepper activeStep={2} onStepClick={handleClick}>
          <Step step={0} label="Step 1" />
          <Step step={1} label="Step 2" />
          <Step step={2} label="Step 3" />
        </Stepper>,
      );
      await user.tab();
      expect(
        screen.getByRole('button', {name: 'Go to step 1: Step 1, completed'}),
      ).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledWith(0);
    });

    it('activates a step with Space', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Stepper activeStep={2} onStepClick={handleClick}>
          <Step step={0} label="Step 1" />
          <Step step={1} label="Step 2" />
          <Step step={2} label="Step 3" />
        </Stepper>,
      );
      await user.tab();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledWith(0);
    });

    it('tabs through steps in document order, skipping disabled ones', async () => {
      const user = userEvent.setup();
      render(
        <Stepper activeStep={3} onStepClick={() => {}}>
          <Step step={0} label="One" />
          <Step step={1} label="Two" isDisabled />
          <Step step={2} label="Three" />
        </Stepper>,
      );
      await user.tab();
      expect(
        screen.getByRole('button', {name: 'Go to step 1: One, completed'}),
      ).toHaveFocus();
      // The disabled step renders no button, so Tab lands on step 3 next.
      await user.tab();
      expect(
        screen.getByRole('button', {name: 'Go to step 3: Three, completed'}),
      ).toHaveFocus();
    });

    it('supports keyboard activation in the on-track layout', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Stepper
          activeStep={2}
          indicatorPosition="on-track"
          onStepClick={handleClick}>
          <Step step={0} label="Cart" />
          <Step step={1} label="Shipping" />
          <Step step={2} label="Payment" />
        </Stepper>,
      );
      await user.tab();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledWith(0);
    });
  });

  describe('fragment-grouped steps', () => {
    const onTrackSteps = (
      <>
        <Step step={0} label="Cart" />
        <Step step={1} label="Shipping" />
        <Step step={2} label="Payment" />
      </>
    );

    it('renders on-track steps identically whether they are flat or grouped in a fragment', () => {
      const flat = render(
        <Stepper activeStep={1} indicatorPosition="on-track">
          <Step step={0} label="Cart" />
          <Step step={1} label="Shipping" />
          <Step step={2} label="Payment" />
        </Stepper>,
      );
      const flatHtml = flat.container.innerHTML;
      flat.unmount();

      const grouped = render(
        <Stepper activeStep={1} indicatorPosition="on-track">
          {onTrackSteps}
        </Stepper>,
      );
      expect(grouped.container.innerHTML).toBe(flatHtml);
    });

    // The connector's end segments are hidden by CSS keyed to the step's own
    // <li> position, which jsdom can't evaluate — assert the wiring instead:
    // every step carries the same hide-if-first/hide-if-last classes, so no
    // step is singled out by counting children.
    it('gives every grouped step the same structural connector classes', () => {
      render(
        <Stepper activeStep={1} indicatorPosition="on-track">
          {onTrackSteps}
        </Stepper>,
      );
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
      for (const item of items) {
        expect(
          item.querySelector('[class*="otSegHiddenIfFirst"]'),
        ).toBeInTheDocument();
        expect(
          item.querySelector('[class*="otSegHiddenIfLast"]'),
        ).toBeInTheDocument();
      }
    });

    it('keeps every grouped step keyboard-activatable', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Stepper
          activeStep={2}
          indicatorPosition="on-track"
          onStepClick={handleClick}>
          {onTrackSteps}
        </Stepper>,
      );
      screen
        .getByRole('button', {name: 'Go to step 2: Shipping, completed'})
        .focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledWith(1);
    });
  });

  describe('hasCollapsibleLabels', () => {
    // The collapse is a container query, so jsdom can't evaluate the media
    // condition — assert the opt-in wiring instead: the collapsible class is
    // applied to non-current horizontal step labels and withheld from the
    // current step and from every step when the prop is off / vertical.
    const labelEl = (testid: string) =>
      screen
        .getByTestId(testid)
        .querySelector('span[class*="label"]') as HTMLElement;

    it('marks non-current horizontal step labels collapsible, but not the current one', () => {
      render(
        <Stepper activeStep={1} orientation="horizontal" hasCollapsibleLabels>
          <Step step={0} label="A" data-testid="a" />
          <Step step={1} label="B" data-testid="b" />
          <Step step={2} label="C" data-testid="c" />
        </Stepper>,
      );
      expect(labelEl('a').className).toContain('labelCollapsible');
      expect(labelEl('c').className).toContain('labelCollapsible');
      // The current step keeps its label unconditionally.
      expect(labelEl('b').className).not.toContain('labelCollapsible');
    });

    it('does not collapse labels when the prop is off', () => {
      render(
        <Stepper activeStep={1} orientation="horizontal">
          <Step step={0} label="A" data-testid="a" />
          <Step step={1} label="B" data-testid="b" />
        </Stepper>,
      );
      expect(labelEl('a').className).not.toContain('labelCollapsible');
    });

    it('does not collapse labels in the vertical orientation', () => {
      render(
        <Stepper activeStep={1} orientation="vertical" hasCollapsibleLabels>
          <Step step={0} label="A" data-testid="a" />
          <Step step={1} label="B" data-testid="b" />
        </Stepper>,
      );
      expect(labelEl('a').className).not.toContain('labelCollapsible');
    });
  });
});
