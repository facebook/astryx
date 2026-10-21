// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectorFamily.focusableDisabled.test.tsx
 * @input Uses vitest, @testing-library/react, Selector, MultiSelector, ComplexSelector
 * @output Conformance tests for spec:AST-085 FR1–FR4 across the Selector family
 * @position Testing; validates the disabled trigger of Selector.tsx, MultiSelector.tsx and ComplexSelector.tsx
 */

import {describe, it, expect, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import {Selector} from '../Selector';
import {MultiSelector} from '../MultiSelector';
import {ComplexSelector} from '../ComplexSelector';

const OPTIONS = ['Apple', 'Banana', 'Cherry'];

type Case = {
  name: string;
  render: (props: {
    isDisabled: boolean;
    onClick?: () => void;
  }) => React.ReactElement;
  trigger: () => HTMLElement;
  submits: boolean;
};

const cases: Case[] = [
  {
    name: 'Selector',
    render: ({isDisabled, onClick}) => (
      <Selector
        label="Fruit"
        htmlName="fruit"
        options={OPTIONS}
        value="Banana"
        onChange={() => {}}
        isDisabled={isDisabled}
        onClick={onClick}
      />
    ),
    trigger: () => screen.getByRole('combobox', {name: 'Fruit'}),
    submits: true,
  },
  {
    name: 'MultiSelector',
    render: ({isDisabled, onClick}) => (
      <MultiSelector
        label="Fruit"
        htmlName="fruit"
        options={OPTIONS}
        value={['Banana']}
        onChange={() => {}}
        isDisabled={isDisabled}
        onClick={onClick}
      />
    ),
    trigger: () => screen.getByRole('combobox', {name: 'Fruit'}),
    submits: true,
  },
  {
    name: 'ComplexSelector',
    render: ({isDisabled, onClick}) => (
      <ComplexSelector
        label="View options"
        value={[]}
        isDisabled={isDisabled}
        onClick={onClick}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>
    ),
    trigger: () => screen.getByRole('button', {name: 'View options'}),
    submits: false,
  },
];

function Harness({
  c,
  isDisabled,
  onClick,
}: {
  c: Case;
  isDisabled: boolean;
  onClick?: () => void;
}) {
  return (
    <form aria-label="Form">
      <button type="button">Before</button>
      {c.render({isDisabled, onClick})}
      <button type="button">After</button>
    </form>
  );
}

describe.each(cases)('$name disabled (spec:AST-085)', c => {
  it('FR1: renders no native disabled and keeps its tab stop', async () => {
    const user = userEvent.setup();
    const {container} = render(<Harness c={c} isDisabled />);
    expect(container.querySelector('[disabled]')).toBeNull();
    const trigger = c.trigger();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('button', {name: 'Before'}));
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'After'})).toHaveFocus();
  });

  it('FR2: no press or key opens it, and a caller press handler does not run', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Harness c={c} isDisabled onClick={onClick} />);
    const trigger = c.trigger();
    await user.click(trigger);
    trigger.focus();
    for (const key of ['{Enter}', ' ', '{ArrowDown}', 'b']) {
      await user.keyboard(key);
    }
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('FR3: submits no value while disabled', () => {
    const {rerender} = render(<Harness c={c} isDisabled={false} />);
    const form = () => screen.getByRole('form', {name: 'Form'});
    if (c.submits) {
      expect(new FormData(form()).getAll('fruit')).toEqual(['Banana']);
    }
    rerender(<Harness c={c} isDisabled />);
    expect(new FormData(form()).getAll('fruit')).toEqual([]);
  });

  it('FR4: keeps focus when it becomes disabled while focused', () => {
    const {rerender} = render(<Harness c={c} isDisabled={false} />);
    const trigger = c.trigger();
    act(() => trigger.focus());
    expect(trigger).toHaveFocus();
    rerender(<Harness c={c} isDisabled />);
    expect(c.trigger()).toHaveFocus();
    expect(c.trigger()).toHaveAttribute('aria-disabled', 'true');
  });
});
