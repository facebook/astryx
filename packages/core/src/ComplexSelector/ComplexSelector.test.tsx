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
import * as stylex from '@stylexjs/stylex';
import {ComplexSelector} from './ComplexSelector';
import {colorVars} from '../theme/tokens.stylex';
import {defineTheme} from '../theme/defineTheme';
import {generateThemeRules} from '../theme/generateThemeRules';

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

    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));
    await user.click(
      screen.getByRole('gridcell', {name: 'Banana Juicy', ...h}),
    );

    expect(onChange).toHaveBeenCalledWith({fruit: 'Banana', ripeness: 'Juicy'});
    expect(screen.getByRole('button', {name: 'Fruit blend'})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
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

    await user.click(screen.getByRole('button', {name: 'Fruit blend'}));
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

    const trigger = screen.getByRole('button', {name: 'Fruit blend'});
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', {name: 'Done', ...h}));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  // ===========================================================================
  // Popup theme target (#4804)
  // ===========================================================================

  describe('popup theme target', () => {
    // The trigger container publishes `astryx-complex-selector`, but the popup
    // rendered only anonymous hashed classes: no stable class on the surface,
    // so neither defineTheme components nor a plain stylesheet could reach its
    // background, border, radius, or width.

    const fruitValue: FruitValue = {fruit: 'Apple', ripeness: 'Ripe'};

    async function openPopup(
      user: ReturnType<typeof userEvent.setup>,
      contentXstyle?: stylex.StyleXStyles,
    ) {
      render(
        <ComplexSelector
          label="Fruit blend"
          value={fruitValue}
          onChange={() => {}}
          contentXstyle={contentXstyle}
          triggerLabel="Apple Ripe">
          {value => <FruitGrid value={value} onChange={() => {}} />}
        </ComplexSelector>,
      );
      await user.click(screen.getByRole('button', {name: 'Fruit blend'}));
      return document.querySelector('.astryx-complex-selector-popup');
    }

    // Collect every injected CSS rule (StyleX runtime injection is enabled in
    // vitest), so assertions read the real declarations behind the popup's
    // atomic classes instead of hashed class names.
    function injectedCss(): string {
      let out = '';
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            out += rule.cssText + '\n';
          }
        } catch {
          // ignore cross-origin sheets
        }
      }
      out += Array.from(document.querySelectorAll('style'))
        .map(s => s.textContent || '')
        .join('\n');
      return out;
    }

    // True when one of el's StyleX atomic classes declares `property`
    // (optionally with a specific value fragment).
    function declares(
      css: string,
      el: Element,
      property: string,
      value?: string,
    ): boolean {
      return Array.from(el.classList)
        .filter(c => c.startsWith('x'))
        .some(c => {
          const rules = css.match(new RegExp(`\\.${c}[^{]*\\{[^}]*\\}`, 'g'));
          return (rules ?? []).some(
            rule =>
              rule.includes(property) &&
              (value == null || rule.includes(value)),
          );
        });
    }

    it('stamps the stable popup class on the popup content container', async () => {
      const user = userEvent.setup();
      const popup = await openPopup(user);

      expect(popup).not.toBeNull();
      // The classed element is the container the trigger controls…
      expect(popup).toHaveAttribute(
        'id',
        screen
          .getByRole('button', {name: 'Fruit blend'})
          .getAttribute('aria-controls'),
      );
      // …and the custom content renders inside it.
      expect(
        popup!.contains(
          screen.getByRole('grid', {name: 'Fruit blend choices', ...h}),
        ),
      ).toBe(true);
    });

    it('paints the popup surface on the classed element', async () => {
      const user = userEvent.setup();
      const popup = await openPopup(user);
      expect(popup).not.toBeNull();
      const css = injectedCss();

      // The stable-classed element owns the surface paint…
      expect(declares(css, popup!, 'background-color')).toBe(true);
      expect(declares(css, popup!, 'border-radius')).toBe(true);
      expect(declares(css, popup!, 'box-shadow')).toBe(true);

      // …and the dialog wrapper above it paints no second surface behind, so
      // a theme override genuinely replaces the surface instead of floating
      // over a differently-shaped default.
      const dialog = screen.getByRole('dialog', {name: 'Fruit blend', ...h});
      expect(popup!.parentElement).toBe(dialog);
      expect(declares(css, dialog, 'background-color')).toBe(false);
      expect(declares(css, dialog, 'box-shadow')).toBe(false);
    });

    it('lets contentXstyle override the surface paint', async () => {
      // The StyleX escape hatch gains the same reach: with the surface on the
      // popup element itself, contentXstyle merges after the surface styles
      // and can replace them.
      const overrides = stylex.create({
        surface: {backgroundColor: colorVars['--color-background-surface']},
      });
      const user = userEvent.setup();
      const popup = await openPopup(user, overrides.surface);
      expect(popup).not.toBeNull();
      const css = injectedCss();

      expect(
        declares(css, popup!, 'background-color', '--color-background-surface'),
      ).toBe(true);
      // StyleX merge dedupes by property, so the default surface background
      // is gone rather than merely covered.
      expect(
        declares(css, popup!, 'background-color', '--color-background-popover'),
      ).toBe(false);
    });

    it('keeps the existing trigger and indicator targets intact', async () => {
      // Guard, not red proof: both targets exist before this change too.
      const user = userEvent.setup();
      await openPopup(user);

      expect(document.querySelector('.astryx-complex-selector')).not.toBeNull();
      expect(
        document.querySelector('.astryx-complex-selector-indicator-icon'),
      ).not.toBeNull();
    });

    it('emits theme CSS for the popup target via defineTheme', () => {
      // Guard for the documented route (defineTheme emits for any target
      // class): the issue's exact use case — a bordered, fixed-width panel.
      const theme = defineTheme({
        name: 'complex-selector-popup-test',
        components: {
          'complex-selector-popup': {
            base: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--color-border)',
              inlineSize: '288px',
            },
          },
        },
      });
      const css = generateThemeRules(theme).join('\n');

      expect(css).toContain('.astryx-complex-selector-popup');
      expect(css).toContain('border-width: 1px');
      expect(css).toContain('inline-size: 288px');
    });
  });
});
