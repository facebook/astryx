// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectorFamily.focusableDisabled.test.tsx
 * @input Uses vitest, @testing-library/react, Selector, MultiSelector
 * @output Conformance tests for spec:AST-085 FR1–FR4 for Selector and MultiSelector
 * @position Testing; validates the disabled trigger of Selector.tsx and MultiSelector.tsx
 */

import {describe, it, expect, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Selector} from '../Selector';
import {MultiSelector} from '../MultiSelector';

const OPTIONS = ['Apple', 'Banana', 'Cherry'];

type Props = {isDisabled: boolean; onClick?: () => void};

const cases = [
  {
    name: 'Selector',
    render: ({isDisabled, onClick}: Props) => (
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
  },
  {
    name: 'MultiSelector',
    render: ({isDisabled, onClick}: Props) => (
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
  },
];

function Harness({c, ...props}: Props & {c: (typeof cases)[number]}) {
  return (
    <form aria-label="Form">
      <button type="button">Before</button>
      {c.render(props)}
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
    const form = () =>
      screen.getByRole<HTMLFormElement>('form', {name: 'Form'});
    expect(new FormData(form()).getAll('fruit')).toEqual(['Banana']);
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
