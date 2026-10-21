// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file InputWrapperDisabledFocusRing.test.tsx
 * @input Uses vitest, @testing-library/react, StyleX, Selector, MultiSelector, ComplexSelector
 * @output Pins where a disabled selector trigger takes the input wrapper's focus ring (spec:AST-085 FR6)
 * @position Testing; validates the style composition order in Selector.tsx, MultiSelector.tsx and ComplexSelector.tsx
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {Selector} from '../Selector';
import {MultiSelector} from '../MultiSelector';
import {ComplexSelector} from '../ComplexSelector';

// jsdom does not match `:focus-within`, so this checks the class instead:
// StyleX hashes each declaration, so the wrapper's `:focus-within` ring yields
// the same atomic class here (the dev build prefixes a debug name; the hash is
// the last token).
const probe = stylex.create({
  ring: {
    boxShadow: {
      default: null,
      ':focus-within': `inset 0px 0px 0px 2px ${colorVars['--color-accent-muted']}`,
    },
  },
});
const RING = stylex.props(probe.ring).className!.split(' ').pop()!;

type Variant = 'input' | 'secondary' | 'ghost';

const cases: {
  name: string;
  render: (variant: Variant) => React.ReactElement;
  wrapper: () => HTMLElement;
}[] = [
  {
    name: 'Selector',
    render: variant => (
      <Selector
        label="Fruit"
        options={['Apple']}
        variant={variant}
        isDisabled
      />
    ),
    wrapper: () => screen.getByRole('combobox').parentElement!,
  },
  {
    name: 'MultiSelector',
    render: variant => (
      <MultiSelector
        label="Fruit"
        options={['Apple']}
        value={[]}
        onChange={() => {}}
        variant={variant}
        isDisabled
      />
    ),
    wrapper: () => screen.getByRole('combobox').parentElement!,
  },
  {
    name: 'ComplexSelector',
    render: variant => (
      <ComplexSelector label="View" value={[]} variant={variant} isDisabled>
        {() => null}
      </ComplexSelector>
    ),
    wrapper: () => screen.getByRole('button', {name: 'View'}).parentElement!,
  },
];

describe.each(cases)('$name disabled trigger focus ring', c => {
  it('keeps the field focus ring on the input variant', () => {
    render(c.render('input'));
    expect(c.wrapper()).toHaveClass(RING);
  });

  it.each(['secondary', 'ghost'] as const)(
    'leaves the %s variant its own focus treatment, with no field ring',
    variant => {
      render(c.render(variant));
      expect(c.wrapper()).not.toHaveClass(RING);
    },
  );
});
