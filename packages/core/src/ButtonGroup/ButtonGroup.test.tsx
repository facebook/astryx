// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonGroup.test.tsx
 * @input Uses vitest, @testing-library/react, @babel/core + @stylexjs/babel-plugin,
 *   ButtonGroup and Button components
 * @output Unit tests for ButtonGroup, incl. the compiled-CSS contract for the
 *   trailing radius (#2508)
 * @position Testing; validates ButtonGroup component implementation
 *
 * SYNC: When ButtonGroup component changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {transformSync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {ButtonGroup} from './ButtonGroup';
import {Button} from '../Button';
import {IconButton} from '../IconButton';
import {DropdownMenu} from '../DropdownMenu';
import {Tooltip} from '../Tooltip';
import {HoverCard} from '../HoverCard';

describe('ButtonGroup', () => {
  it('renders a group with aria-label', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
        <Button label="Cut" />
        <Button label="Paste" />
      </ButtonGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-label', 'Actions');
  });

  it('renders all child buttons', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
        <Button label="Cut" />
        <Button label="Paste" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Paste'})).toBeInTheDocument();
  });

  it('works with IconButton children', () => {
    render(
      <ButtonGroup label="Text formatting">
        <IconButton
          label="Bold"
          icon={<span data-testid="bold-icon">B</span>}
        />
        <IconButton
          label="Italic"
          icon={<span data-testid="italic-icon">I</span>}
        />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Bold'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Italic'})).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    render(
      <ButtonGroup label="Actions" data-testid="my-group">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByTestId('my-group')).toBeInTheDocument();
  });

  it('forwards ref to the root element', () => {
    let refValue: HTMLDivElement | null = null;
    render(
      <ButtonGroup
        label="Actions"
        ref={el => {
          refValue = el;
        }}>
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(refValue).toBeInstanceOf(HTMLDivElement);
    expect(refValue).toBe(screen.getByRole('group'));
  });

  it('reflects orientation via data-orientation, not aria-orientation', () => {
    // aria-orientation is not a valid ARIA attribute on role="group"; the
    // orientation is exposed through data-orientation instead.
    const {rerender} = render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    let group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('aria-orientation');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');

    rerender(
      <ButtonGroup label="Actions" orientation="vertical">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    group = screen.getByRole('group');
    expect(group).not.toHaveAttribute('aria-orientation');
    expect(group).toHaveAttribute('data-orientation', 'vertical');
  });

  it('renders with vertical orientation', () => {
    render(
      <ButtonGroup label="Actions" orientation="vertical">
        <Button label="Copy" />
        <Button label="Cut" />
      </ButtonGroup>,
    );

    const group = screen.getByRole('group');
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const {rerender} = render(
      <ButtonGroup label="Actions" size="sm">
        <Button label="Copy" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();

    rerender(
      <ButtonGroup label="Actions" size="lg">
        <Button label="Copy" />
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('disables all buttons when isDisabled is true', () => {
    render(
      <ButtonGroup label="Actions" isDisabled>
        <Button label="Copy" />
        <Button label="Cut" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', {name: 'Copy'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Cut'})).toBeDisabled();
  });

  it('does not set aria-disabled when not disabled', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('group')).not.toHaveAttribute('aria-disabled');
  });

  it('renders a single button without errors', () => {
    render(
      <ButtonGroup label="Actions">
        <Button label="Copy" />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('renders mixed Button and IconButton children', () => {
    render(
      <ButtonGroup label="Edit actions">
        <Button label="Edit" />
        <IconButton label="More options" icon={<span>▼</span>} />
      </ButtonGroup>,
    );

    expect(screen.getByRole('button', {name: 'Edit'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'More options'}),
    ).toBeInTheDocument();
  });

  // ===========================================================================
  // Trailing radius (issue #2508)
  //
  // The trailing end cap cannot be keyed off `:last-child`: members render an
  // invisible layer AFTER their button (tooltip'd Button, DropdownMenu), and
  // useLayer renders it inline rather than portaling it, so the layer steals the
  // slot. See IS_LAST_ITEM in Button.tsx.
  //
  // HOW THESE TESTS CATCH THE BUG
  // jsdom applies no StyleX CSS, so a DOM-only test cannot prove which rule
  // wins — and a test that hand-copies the selector is a tautology (revert
  // groupStyles to `:last-child` and it still passes). So the predicate is NOT
  // hand-copied here: `compileButtonRules()` runs the REAL StyleX babel plugin
  // over Button.tsx (same config as scripts/build-css.mjs) and reads the
  // trailing-radius rule's selector straight out of the emitted CSS, then
  // matches it against the real rendered DOM. Revert groupStyles to
  // `:last-child` and these go red.
  // ===========================================================================
  describe('trailing radius (#2508)', () => {
    /** The group members, in DOM order (excludes invisible layer siblings). */
    const items = (group: HTMLElement): Element[] =>
      Array.from(group.querySelectorAll(':scope > *:not([popover])'));

    // -- Compiled CSS, read from the source -----------------------------------

    /** One atomic StyleX rule, parsed out of the plugin's emitted CSS. */
    type CompiledRule = {
      /** Atomic class name, e.g. `xp0wexf`. */
      className: string;
      /** Selector text after the class, e.g. `:first-child`. '' if unconditional. */
      condition: string;
      /** CSS property, e.g. `border-start-end-radius`. */
      property: string;
      /** CSS value, e.g. `var(--radius-element)`. */
      value: string;
      /** The full compiled selector, e.g. `.xp0wexf:not(:has(~ [data-...]))`. */
      selector: string;
    };

    /**
     * Compiles Button.tsx with the real StyleX babel plugin and returns its
     * atomic rules. This is the CSS the browser actually gets — the whole point
     * is that the trailing-radius predicate comes from the SOURCE, never from a
     * string retyped in this file.
     */
    function compileButtonRules(): CompiledRule[] {
      const repoRoot = path.resolve(__dirname, '../../../..');
      const buttonSrc = path.resolve(__dirname, '../Button/Button.tsx');

      const result = transformSync(readFileSync(buttonSrc, 'utf8'), {
        babelrc: false,
        configFile: false,
        filename: buttonSrc,
        presets: [
          ['@babel/preset-typescript', {isTSX: true, allExtensions: true}],
          ['@babel/preset-react', {runtime: 'automatic'}],
        ],
        plugins: [
          [
            stylexBabelPlugin,
            {
              dev: false,
              runtimeInjection: false,
              genConditionalClasses: true,
              treeshakeCompensation: true,
              unstable_moduleResolution: {type: 'commonJS', rootDir: repoRoot},
            },
          ],
        ],
      });

      const rules =
        (result?.metadata as {stylex?: [string, {ltr: string}, number][]})
          ?.stylex ?? [];

      return rules.flatMap(([, {ltr}]) => {
        // Plain atomic rules only: `.cls<condition>{prop:value}`. @media-wrapped
        // rules are irrelevant to the radius contract.
        const parsed = /^\.([\w-]+)([^{]*)\{([\w-]+):(.+)\}$/.exec(ltr);
        if (!parsed) {
          return [];
        }
        const [, className, condition, property, value] = parsed;
        return [
          {
            className,
            condition,
            property,
            value,
            selector: `.${className}${condition}`,
          },
        ];
      });
    }

    const COMPILED = compileButtonRules();

    /** A rounded (non-zero) corner is exactly this value in the compiled CSS. */
    const ROUNDED = 'var(--radius-element)';

    /** The two corners on the group's trailing edge — pure geometry. */
    const TRAILING_CORNERS = {
      horizontal: ['border-end-end-radius', 'border-start-end-radius'],
      vertical: ['border-end-end-radius', 'border-end-start-radius'],
    } as const;

    /** The two corners on the group's leading edge — pure geometry. */
    const LEADING_CORNERS = {
      horizontal: ['border-end-start-radius', 'border-start-start-radius'],
      vertical: ['border-start-end-radius', 'border-start-start-radius'],
    } as const;

    type Orientation = keyof typeof TRAILING_CORNERS;

    /**
     * The compiled rules that ROUND `corners` and are actually applied to `el`
     * (its class list carries them). StyleX emits the `default: 0` class and the
     * conditional class on every member, so this returns the same rules for any
     * member of the group — which rule *wins* is decided by the selector, and
     * that is what the tests below assert against the DOM.
     */
    const roundingRules = (
      el: Element,
      corners: ReadonlyArray<string>,
    ): CompiledRule[] =>
      COMPILED.filter(
        rule =>
          corners.includes(rule.property) &&
          rule.value === ROUNDED &&
          el.classList.contains(rule.className),
      );

    /** The compiled selectors that round `el`'s trailing corners. */
    const trailingRoundingSelectors = (
      el: Element,
      orientation: Orientation,
    ): string[] => {
      const rules = roundingRules(el, TRAILING_CORNERS[orientation]);
      // Guard against a vacuous pass: both trailing corners must be accounted
      // for, or the assertions below would be quantifying over an empty set.
      expect(rules.map(rule => rule.property).sort()).toEqual([
        ...TRAILING_CORNERS[orientation],
      ]);
      return rules.map(rule => rule.selector);
    };

    /** Does the compiled CSS actually round `el`'s trailing corners? */
    const hasRoundedTrailingCorners = (
      el: Element,
      orientation: Orientation = 'horizontal',
    ): boolean =>
      trailingRoundingSelectors(el, orientation).every(selector =>
        el.matches(selector),
      );

    // -- The compiled CSS contract --------------------------------------------

    it.each(['horizontal', 'vertical'] as const)(
      'keys the trailing radius off layer-skipping, not :last-child (%s)',
      orientation => {
        render(
          <ButtonGroup label="Actions" orientation={orientation}>
            <Button label="Save" />
          </ButtonGroup>,
        );

        const save = screen.getByRole('button', {name: 'Save'});
        const selectors = trailingRoundingSelectors(save, orientation);

        for (const selector of selectors) {
          // `:last-child` is the bug: an inline layer element steals the slot.
          expect(selector).not.toContain(':last-child');
          // `[popover]` must survive compilation *verbatim*. StyleX only
          // statically evaluates a selector key from a same-file const; from a
          // .stylex.ts file it compiles to a mangled selector like `[x13pbwiz]`
          // that matches nothing in the DOM.
          expect(selector).toContain('[popover]');
        }
      },
    );

    it.each(['horizontal', 'vertical'] as const)(
      'still rounds the leading corners off :first-child (%s)',
      orientation => {
        render(
          <ButtonGroup label="Actions" orientation={orientation}>
            <Button label="Save" />
            <Button label="More" tooltip="More options" />
          </ButtonGroup>,
        );

        const save = screen.getByRole('button', {name: 'Save'});
        const more = screen.getByRole('button', {name: 'More'});
        const rules = roundingRules(save, LEADING_CORNERS[orientation]);

        expect(rules.map(rule => rule.property).sort()).toEqual([
          ...LEADING_CORNERS[orientation],
        ]);
        for (const {condition, selector} of rules) {
          // The leading edge is genuinely safe on :first-child — a member's
          // button always precedes its own layer.
          expect(condition).toBe(':first-child');
          expect(save.matches(selector)).toBe(true);
          expect(more.matches(selector)).toBe(false);
        }
      },
    );

    // -- The compiled CSS, matched against the real DOM ------------------------

    it.each(['horizontal', 'vertical'] as const)(
      'rounds a tooltip’d trailing Button, whose layer follows it in the DOM (%s)',
      orientation => {
        render(
          <ButtonGroup label="Actions" orientation={orientation}>
            <Button label="Save" />
            <Button label="More" tooltip="More options" />
          </ButtonGroup>,
        );

        const group = screen.getByRole('group');
        const save = screen.getByRole('button', {name: 'Save'});
        const more = screen.getByRole('button', {name: 'More'});

        // Precondition: the tooltip layer really is an inline DOM sibling that
        // follows the button — this is exactly what broke `:last-child`.
        expect(more).not.toBe(group.lastElementChild);
        expect(items(group).at(-1)).toBe(more);

        expect(hasRoundedTrailingCorners(more, orientation)).toBe(true);
        expect(hasRoundedTrailingCorners(save, orientation)).toBe(false);
      },
    );

    it.each(['horizontal', 'vertical'] as const)(
      'rounds a trailing DropdownMenu trigger, whose popover follows it (%s)',
      orientation => {
        render(
          <ButtonGroup label="Approve action" orientation={orientation}>
            <Button label="Allow once" variant="primary" />
            <DropdownMenu
              button={{label: 'Allow options', variant: 'primary'}}
              items={[{label: 'Always allow'}]}
            />
          </ButtonGroup>,
        );

        const group = screen.getByRole('group');
        const allow = screen.getByRole('button', {name: 'Allow once'});
        const trigger = screen.getByRole('button', {name: 'Allow options'});

        // The popover surface is an inline sibling after the trigger.
        expect(trigger).not.toBe(group.lastElementChild);
        expect(items(group).at(-1)).toBe(trigger);

        expect(hasRoundedTrailingCorners(trigger, orientation)).toBe(true);
        expect(hasRoundedTrailingCorners(allow, orientation)).toBe(false);
      },
    );

    it('rounds a trailing link (<a>) member with a tooltip', () => {
      render(
        <ButtonGroup label="Actions">
          <Button label="Save" />
          <Button label="Docs" href="https://example.com" tooltip="Open docs" />
        </ButtonGroup>,
      );

      const group = screen.getByRole('group');
      const link = screen.getByRole('link', {name: 'Docs'});

      expect(link.tagName).toBe('A');
      expect(link).not.toBe(group.lastElementChild);
      expect(items(group).at(-1)).toBe(link);

      expect(hasRoundedTrailingCorners(link)).toBe(true);
    });

    it('rounds only the last member (first/middle/last)', () => {
      render(
        <ButtonGroup label="Actions">
          <Button label="First" />
          <Button label="Middle" tooltip="Middle tip" />
          <DropdownMenu
            button={{label: 'Last'}}
            items={[{label: 'An option'}]}
          />
        </ButtonGroup>,
      );

      const group = screen.getByRole('group');
      const [first, middle, last] = items(group);

      expect([first, middle, last].map(el => el.textContent)).toEqual([
        'First',
        'Middle',
        'Last',
      ]);

      // Middle has a tooltip layer after it, but a *marked* sibling follows too,
      // so it must NOT take the trailing radius.
      expect(hasRoundedTrailingCorners(first)).toBe(false);
      expect(hasRoundedTrailingCorners(middle)).toBe(false);
      expect(hasRoundedTrailingCorners(last)).toBe(true);
    });

    it('rounds both edges of a lone tooltip’d member', () => {
      render(
        <ButtonGroup label="Actions">
          <Button label="Only" tooltip="The only one" />
        </ButtonGroup>,
      );

      const only = screen.getByRole('button', {name: 'Only'});

      // Leading edge is unaffected: a member's button always precedes its layer.
      expect(only.matches(':first-child')).toBe(true);
      expect(hasRoundedTrailingCorners(only)).toBe(true);
    });

    // -- Members the group does not recognise ---------------------------------
    //
    // The trailing predicate must stay CONSERVATIVE: a sibling the group does
    // not understand is still a member. Otherwise the button BEFORE it wrongly
    // takes the trailing radius and renders as a rounded notch mid-group —
    // worse than the bug being fixed, because it is silent and visual.

    it('does not round the preceding button when a Tooltip-wrapped member follows', () => {
      render(
        <ButtonGroup label="Actions">
          <Button label="Save" />
          <Tooltip content="Rich tip">
            <Button label="More" />
          </Tooltip>
        </ButtonGroup>,
      );

      const save = screen.getByRole('button', {name: 'Save'});

      // Tooltip wraps element children in a `display: contents` <div>, so the
      // inner Button is a DESCENDANT of the wrapper, not a DOM sibling of Save.
      expect(hasRoundedTrailingCorners(save)).toBe(false);
    });

    it('does not round the preceding button when a HoverCard-wrapped member follows', () => {
      render(
        <ButtonGroup label="Actions">
          <Button label="Save" />
          <HoverCard content="Preview">
            <Button label="More" />
          </HoverCard>
        </ButtonGroup>,
      );

      const save = screen.getByRole('button', {name: 'Save'});

      // Button has no `hoverCard` prop, so wrapping is the ONLY way to put a
      // HoverCard on a group button — this composition has no alternative.
      expect(hasRoundedTrailingCorners(save)).toBe(false);
    });

    it('does not round the preceding button when a raw <button> follows', () => {
      render(
        <ButtonGroup label="Actions">
          <Button label="Save" />
          <button type="button">Custom</button>
        </ButtonGroup>,
      );

      const save = screen.getByRole('button', {name: 'Save'});

      expect(hasRoundedTrailingCorners(save)).toBe(false);
    });
  });
});
