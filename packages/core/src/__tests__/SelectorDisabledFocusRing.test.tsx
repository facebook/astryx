// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectorDisabledFocusRing.test.tsx
 * @input Uses vitest, @testing-library/react, StyleX, Selector, MultiSelector
 * @output Pins which disabled selector triggers carry their own keyboard focus ring (spec:AST-085 FR6)
 * @position Testing; validates the disabled trigger styles in Selector.tsx and MultiSelector.tsx
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {Selector} from '../Selector';
import {MultiSelector} from '../MultiSelector';

// jsdom does not match `:has(...:focus-visible)`; StyleX hashes each
// declaration, so the ring's atomic class is the last token of this probe.
const probe = stylex.create({
  ring: {
    boxShadow: {
      default: null,
      ':has(> [aria-disabled="true"]:focus-visible)': `inset 0px 0px 0px 2px ${colorVars['--color-accent-muted']}`,
    },
  },
});
const RING = stylex.props(probe.ring).className!.split(' ').pop()!;

type Variant = 'input' | 'secondary' | 'ghost';

describe.each([
  {
    name: 'Selector',
    field: (variant: Variant) => (
      <Selector
        label="Fruit"
        options={['Apple']}
        variant={variant}
        isDisabled
      />
    ),
  },
  {
    name: 'MultiSelector',
    field: (variant: Variant) => (
      <MultiSelector
        label="Fruit"
        options={['Apple']}
        value={[]}
        onChange={() => {}}
        variant={variant}
        isDisabled
      />
    ),
  },
])('$name disabled trigger', ({field}) => {
  const renderWith = (variant: Variant) => render(field(variant));
  const wrapper = () => screen.getByRole('combobox').parentElement!;

  it('shows keyboard focus on the input variant', () => {
    renderWith('input');
    expect(wrapper()).toHaveClass(RING);
    expect(getComputedStyle(wrapper()).cursor).toBe('default');
  });

  it.each(['secondary', 'ghost'] as const)(
    'leaves the %s variant its own focus outline',
    variant => {
      renderWith(variant);
      expect(wrapper()).not.toHaveClass(RING);
    },
  );
});
