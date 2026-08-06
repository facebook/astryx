// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComplexSelector.test.tsx
 * @input Uses vitest, Testing Library, user-event
 * @output Unit tests for ComplexSelector
 * @position Tests; validates custom content, async actions, and dialog composition
 *
 * SYNC: When ComplexSelector.tsx API changes, update these tests.
 */

import {describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {CompiledStyles} from '@stylexjs/stylex';
import {ComplexSelector} from './ComplexSelector';
import {
  inputStatusBorderStyles,
  inputStatusFocusShadowStyles,
  inputWrapperStyles,
} from '../Field';
import {InternationalizationProvider} from '../i18n';
import {SizeProvider} from '../SizeContext';
import {colorVars} from '../theme/tokens.stylex';

type FruitValue = {
  fruit: 'Apple' | 'Banana';
  ripeness: 'Crisp' | 'Ripe' | 'Juicy';
};

const FRUITS = ['Apple', 'Banana'] as const;
const RIPENESS = ['Crisp', 'Ripe', 'Juicy'] as const;
const h = {hidden: true} as const;

function FruitGrid({
  value,
  onChange,
}: {
  value: FruitValue;
  onChange: (value: FruitValue) => void;
}) {
  return (
    <div role="grid" aria-label="Fruit blend choices">
      {FRUITS.flatMap(fruit =>
        RIPENESS.map(ripeness => {
          const isSelected =
            value.fruit === fruit && value.ripeness === ripeness;
          return (
            <button
              key={`${fruit}-${ripeness}`}
              type="button"
              role="gridcell"
              aria-label={`${fruit} ${ripeness}`}
              aria-selected={isSelected || undefined}
              onClick={() => onChange({fruit, ripeness})}>
              {fruit} {ripeness}
            </button>
          );
        }),
      )}
    </div>
  );
}

function FruitComplexSelector({
  value,
  onChange,
  changeAction,
}: {
  value: FruitValue;
  onChange: (value: FruitValue) => void;
  changeAction?: (value: FruitValue) => void | Promise<void>;
}) {
  return (
    <ComplexSelector
      label="Fruit blend"
      value={value}
      onChange={onChange}
      changeAction={changeAction}
      triggerLabel={`${value.fruit} ${value.ripeness}`}>
      {(value, onChange, close) => (
        <FruitGrid
          value={value}
          onChange={nextValue => {
            onChange(nextValue);
            close();
          }}
        />
      )}
    </ComplexSelector>
  );
}

describe('ComplexSelector', () => {
  it('renders custom content with value and commits through onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <FruitComplexSelector
        value={{fruit: 'Apple', ripeness: 'Ripe'}}
        onChange={onChange}
      />,
    );

    await user.click(
      screen.getByRole('button', {name: 'Fruit blend Apple Ripe'}),
    );
    await user.click(
      screen.getByRole('gridcell', {name: 'Banana Juicy', ...h}),
    );

    expect(onChange).toHaveBeenCalledWith({fruit: 'Banana', ripeness: 'Juicy'});
    expect(
      screen.getByRole('button', {name: 'Fruit blend Apple Ripe'}),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('gives the popup clearance on both block edges, not just the leading one (#4803)', async () => {
    const user = userEvent.setup();
    render(
      <FruitComplexSelector
        value={{fruit: 'Apple', ripeness: 'Ripe'}}
        onChange={() => {}}
      />,
    );
    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));
    const popup = document.querySelector('[popover]') as HTMLElement;
    expect(popup).not.toBeNull();
    const style = getComputedStyle(popup);
    // Only the leading edge (marginBlockStart) had clearance, which is
    // correct for a popup that opens downward but leaves zero clearance
    // when the same popup opens upward (placement="above") — the trailing
    // edge is what's nearest the trigger in that orientation. Popover (built
    // on the same usePopover/useLayer pair) sets both edges via its own
    // `gap` style, which is what this mirrors. jsdom doesn't resolve the
    // marginBlockStart/marginBlockEnd logical computed-style properties for
    // this element (both return '' regardless), so assert on the equivalent
    // physical properties instead, which do resolve correctly here.
    expect(style.marginTop).toBe('var(--spacing-1)');
    expect(style.marginBottom).toBe('var(--spacing-1)');
  });

  it('runs changeAction through the provided onChange helper', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const changeAction = vi.fn();

    render(
      <FruitComplexSelector
        value={{fruit: 'Apple', ripeness: 'Ripe'}}
        onChange={onChange}
        changeAction={changeAction}
      />,
    );

    await user.click(
      screen.getByRole('button', {name: 'Fruit blend Apple Ripe'}),
    );
    await user.click(
      screen.getByRole('gridcell', {name: 'Banana Crisp', ...h}),
    );

    expect(onChange).toHaveBeenCalledWith({fruit: 'Banana', ripeness: 'Crisp'});
    await waitFor(() => {
      expect(changeAction).toHaveBeenCalledWith({
        fruit: 'Banana',
        ripeness: 'Crisp',
      });
    });
  });

  it('passes a close helper to composed content', async () => {
    const user = userEvent.setup();

    render(
      <ComplexSelector label="Fruit blend" value="Apple" triggerLabel="Apple">
        {(_value, _onChange, close) => (
          <button type="button" onClick={close}>
            Done
          </button>
        )}
      </ComplexSelector>,
    );

    const trigger = screen.getByRole('button', {name: 'Fruit blend Apple'});
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', {name: 'Done', ...h}));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

// Replica of the removed component-local focus ring. StyleX atomic class names
// are deterministic per (property, value, condition), so these compile to the
// exact classes the component would render if it ever reintroduced its own
// outline on top of the shared inputWrapperStyles focus treatment.
const removedFocusRingStyles = stylex.create({
  focusRing: {
    ':focus-within': {
      outline: `2px solid ${colorVars['--color-accent']}`,
      outlineOffset: '2px',
    },
  },
});

/** Class list of a bare div rendered with the given StyleX styles. */
function classesOf(...styleArgs: ReadonlyArray<CompiledStyles>) {
  const {container, unmount} = render(
    <div data-testid="style-ref" {...stylex.props(...styleArgs)} />,
  );
  const el = container.firstElementChild as HTMLElement;
  const classes = el.className.split(' ').filter(Boolean);
  unmount();
  return classes;
}

function wrapperOf(container: HTMLElement): HTMLElement {
  const wrapper = container.querySelector('.astryx-complex-selector');
  expect(wrapper).not.toBeNull();
  return wrapper as HTMLElement;
}

describe('ComplexSelector hardening (#4710)', () => {
  describe('trigger accessible name', () => {
    it('announces the current value after the label', () => {
      render(
        <FruitComplexSelector
          value={{fruit: 'Apple', ripeness: 'Ripe'}}
          onChange={vi.fn()}
        />,
      );
      expect(
        screen.getByRole('button', {name: 'Fruit blend Apple Ripe'}),
      ).toBeInTheDocument();
    });

    it('announces the placeholder when no value is selected', () => {
      render(
        <ComplexSelector label="Fruit blend" value={null}>
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      expect(
        screen.getByRole('button', {name: 'Fruit blend Select…'}),
      ).toBeInTheDocument();
    });
  });

  describe('keyboard', () => {
    it('opens the popup on ArrowDown from the closed trigger', async () => {
      const user = userEvent.setup();
      render(
        <FruitComplexSelector
          value={{fruit: 'Apple', ripeness: 'Ripe'}}
          onChange={vi.fn()}
        />,
      );
      const trigger = screen.getByRole('button', {name: /Fruit blend/});
      trigger.focus();
      await user.keyboard('{ArrowDown}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens the popup on ArrowUp from the closed trigger', async () => {
      const user = userEvent.setup();
      render(
        <FruitComplexSelector
          value={{fruit: 'Apple', ripeness: 'Ripe'}}
          onChange={vi.fn()}
        />,
      );
      const trigger = screen.getByRole('button', {name: /Fruit blend/});
      trigger.focus();
      await user.keyboard('{ArrowUp}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('returns focus to the trigger when the popup closes on Escape', async () => {
      const user = userEvent.setup();
      render(
        <FruitComplexSelector
          value={{fruit: 'Apple', ripeness: 'Ripe'}}
          onChange={vi.fn()}
        />,
      );
      const trigger = screen.getByRole('button', {name: /Fruit blend/});
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      // The dialog auto-focuses its first element on the next animation
      // frame. Wait for that to land before pressing Escape so the test
      // models the real sequence (focus enters the dialog, then restores) —
      // an Escape inside the same frame races usePopover's un-canceled
      // autofocus rAF, which is that hook's latent bug, not this component's.
      await waitFor(() =>
        expect(
          screen.getByRole('gridcell', {name: 'Apple Crisp', ...h}),
        ).toHaveFocus(),
      );
      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  });

  describe('status treatment', () => {
    it.each(['warning', 'error', 'success'] as const)(
      'applies the shared %s border and focus-preserving shadow styles to the trigger wrapper',
      type => {
        const {container} = render(
          <ComplexSelector
            label="Fruit blend"
            value="Apple"
            triggerLabel="Apple"
            status={{type, message: 'Status message'}}>
            {() => <div>content</div>}
          </ComplexSelector>,
        );
        const wrapper = wrapperOf(container);
        // inputStatusFocusShadowStyles, not inputStatusHoverShadowStyles:
        // the focus variant keeps the base :focus-within ring visible, so a
        // status'd trigger still shows keyboard focus.
        const expected = classesOf(
          inputStatusBorderStyles[type],
          inputStatusFocusShadowStyles[type],
        );
        expect(expected.length).toBeGreaterThan(0);
        for (const cls of expected) {
          expect(wrapper.classList.contains(cls)).toBe(true);
        }
      },
    );

    it('suppresses the status hover shadow when disabled', () => {
      const {container} = render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          isDisabled
          status={{type: 'error', message: 'Required'}}>
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      const wrapper = wrapperOf(container);
      // The status shadow style also compiles a shared `boxShadow: none`
      // default class that base/disabled legitimately render — only the
      // classes unique to the status shadow must be absent.
      const baseline = new Set(
        classesOf(inputWrapperStyles.base, inputWrapperStyles.disabled),
      );
      const statusShadow = classesOf(inputStatusFocusShadowStyles.error).filter(
        cls => !baseline.has(cls),
      );
      expect(statusShadow.length).toBeGreaterThan(0);
      const border = classesOf(inputStatusBorderStyles.error);
      for (const cls of statusShadow) {
        expect(wrapper.classList.contains(cls)).toBe(false);
      }
      // The status border itself still shows on a disabled field.
      for (const cls of border) {
        expect(wrapper.classList.contains(cls)).toBe(true);
      }
    });

    it('replaces the chevron with a status icon for the attached variant', () => {
      const {container} = render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          status={{type: 'error', message: 'Required'}}>
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      expect(
        container.querySelector('.astryx-complex-selector-indicator-icon'),
      ).toBeNull();
      // The chevron must be replaced by a status icon, not silently dropped.
      expect(
        container.querySelector('.astryx-complex-selector .astryx-icon'),
      ).not.toBeNull();
    });

    it('keeps the chevron for the detached variant', () => {
      const {container} = render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          status={{type: 'error', message: 'Required'}}
          statusVariant="detached">
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      expect(
        container.querySelector('.astryx-complex-selector-indicator-icon'),
      ).not.toBeNull();
    });

    it('renders a focusable status details button for the tooltip variant', () => {
      render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          status={{type: 'error', message: 'Required'}}
          statusVariant="tooltip">
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      expect(
        screen.getByRole('button', {name: 'Error details'}),
      ).toBeInTheDocument();
    });

    it('routes the message through the tooltip describedBy for the tooltip variant', () => {
      render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          status={{type: 'error', message: 'Required'}}
          statusVariant="tooltip">
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      const trigger = screen.getByRole('button', {name: /Fruit blend/});
      const statusButton = screen.getByRole('button', {name: 'Error details'});
      const tooltipId = statusButton.getAttribute('aria-describedby');
      expect(tooltipId).toBeTruthy();
      const describedBy = trigger.getAttribute('aria-describedby') ?? '';
      // The trigger points at the tooltip, not at an attached message node.
      expect(describedBy.split(/\s+/)).toContain(tooltipId);
    });

    it('sets aria-invalid only for error status', () => {
      const {rerender} = render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          status={{type: 'error', message: 'Required'}}>
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      expect(screen.getByRole('button', {name: /Fruit blend/})).toHaveAttribute(
        'aria-invalid',
        'true',
      );
      rerender(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          status={{type: 'warning', message: 'Careful'}}>
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      expect(
        screen.getByRole('button', {name: /Fruit blend/}),
      ).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('size', () => {
    it('resolves size from SizeContext like sibling inputs', () => {
      const {container} = render(
        <SizeProvider value="sm">
          <ComplexSelector
            label="Fruit blend"
            value="Apple"
            triggerLabel="Apple">
            {() => <div>content</div>}
          </ComplexSelector>
        </SizeProvider>,
      );
      expect(wrapperOf(container)).toHaveAttribute('data-size', 'sm');
    });

    it('lets an explicit size prop win over SizeContext', () => {
      const {container} = render(
        <SizeProvider value="sm">
          <ComplexSelector
            label="Fruit blend"
            value="Apple"
            triggerLabel="Apple"
            size="lg">
            {() => <div>content</div>}
          </ComplexSelector>
        </SizeProvider>,
      );
      expect(wrapperOf(container)).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('focus treatment', () => {
    it('does not stack a second outline on the shared wrapper focus ring', () => {
      const {container} = render(
        <ComplexSelector label="Fruit blend" value="Apple" triggerLabel="Apple">
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      const wrapper = wrapperOf(container);
      const removed = classesOf(removedFocusRingStyles.focusRing);
      expect(removed.length).toBeGreaterThan(0);
      for (const cls of removed) {
        expect(wrapper.classList.contains(cls)).toBe(false);
      }
    });
  });

  describe('i18n', () => {
    it('resolves the default placeholder from its own component key', () => {
      render(
        <InternationalizationProvider
          locale="en"
          overrides={{
            en: {'@astryx.complexSelector.placeholder': 'Pick something…'},
          }}>
          <ComplexSelector label="Fruit blend" value={null}>
            {() => <div>content</div>}
          </ComplexSelector>
        </InternationalizationProvider>,
      );
      expect(
        screen.getByRole('button', {name: /Pick something…/}),
      ).toBeInTheDocument();
    });
  });

  describe('structure', () => {
    it('forwards ref to the trigger wrapper', () => {
      const ref = createRef<HTMLDivElement>();
      const {container} = render(
        <ComplexSelector
          ref={ref}
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple">
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      expect(ref.current).toBe(wrapperOf(container));
    });
  });

  describe('state coverage', () => {
    it('does not open when disabled', async () => {
      const user = userEvent.setup();
      render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          isDisabled>
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      const trigger = screen.getByRole('button', {name: /Fruit blend/});
      expect(trigger).toBeDisabled();
      await user.click(trigger.parentElement as HTMLElement);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows a spinner and aria-busy while loading', () => {
      const {container} = render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          isLoading>
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      expect(screen.getByRole('button', {name: /Fruit blend/})).toHaveAttribute(
        'aria-busy',
        'true',
      );
      expect(container.querySelector('.astryx-spinner')).not.toBeNull();
    });

    it('wires aria-haspopup, aria-controls, and the described-by chain', async () => {
      const user = userEvent.setup();
      render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          triggerLabel="Apple"
          description="Choose your blend"
          isRequired
          status={{type: 'error', message: 'Required'}}>
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      const trigger = screen.getByRole('button', {name: /Fruit blend/});
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-required', 'true');

      const describedBy = trigger.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const describedText = (describedBy as string)
        .split(' ')
        .map(id => document.getElementById(id)?.textContent ?? '')
        .join(' ');
      expect(describedText).toContain('Choose your blend');
      expect(describedText).toContain('Required');

      await user.click(trigger);
      const contentId = trigger.getAttribute('aria-controls') as string;
      expect(document.getElementById(contentId)).toHaveTextContent('content');
    });

    it('reflects the indicator theme target state across open and close', async () => {
      const user = userEvent.setup();
      const {container} = render(
        <ComplexSelector label="Fruit blend" value="Apple" triggerLabel="Apple">
          {() => <div>content</div>}
        </ComplexSelector>,
      );
      const indicator = container.querySelector(
        '.astryx-complex-selector-indicator-icon',
      );
      expect(indicator).toHaveAttribute('data-state', 'collapsed');
      await user.click(screen.getByRole('button', {name: /Fruit blend/}));
      expect(indicator).toHaveAttribute('data-state', 'expanded');
    });

    it('passes the optimistic value to children while changeAction is pending', async () => {
      const user = userEvent.setup();
      let resolveAction: () => void = () => {};
      const changeAction = vi.fn(async () => {
        await new Promise<void>(resolve => {
          resolveAction = resolve;
        });
      });
      const seen: string[] = [];

      render(
        <ComplexSelector
          label="Fruit blend"
          value="Apple"
          changeAction={changeAction}
          triggerLabel="Apple">
          {(value, onChange) => (
            <div>
              {seen.push(value) && null}
              <button type="button" onClick={() => onChange('Banana')}>
                Choose Banana
              </button>
            </div>
          )}
        </ComplexSelector>,
      );

      await user.click(screen.getByRole('button', {name: /Fruit blend/}));
      await user.click(
        screen.getByRole('button', {name: 'Choose Banana', ...h}),
      );
      await waitFor(() => {
        expect(seen).toContain('Banana');
      });
      resolveAction();
    });
  });
});
