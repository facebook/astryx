// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComplexSelector.focusableDisabled.test.tsx
 * @input Uses vitest, @testing-library/react, ComplexSelector
 * @output Conformance tests for spec:AST-085 FR1, FR2 and FR4 on ComplexSelector
 * @position Testing; validates the disabled trigger of ComplexSelector.tsx
 */

import {describe, it, expect, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ComplexSelector} from './ComplexSelector';

function Harness(props: {isDisabled: boolean; onClick?: () => void}) {
  return (
    <>
      <button type="button">Before</button>
      <ComplexSelector label="View options" value={[]} {...props}>
        {() => <button type="button">Apply</button>}
      </ComplexSelector>
      <button type="button">After</button>
    </>
  );
}

const trigger = () => screen.getByRole('button', {name: 'View options'});

describe('ComplexSelector disabled (spec:AST-085)', () => {
  it('FR1: renders no native disabled and keeps its tab stop', async () => {
    const user = userEvent.setup();
    const {container} = render(<Harness isDisabled />);
    expect(container.querySelector('[disabled]')).toBeNull();
    expect(trigger()).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('button', {name: 'Before'}));
    await user.tab();
    expect(trigger()).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'After'})).toHaveFocus();
  });

  it('FR2: no press or key opens it, and a caller press handler does not run', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Harness isDisabled onClick={onClick} />);
    await user.click(trigger());
    trigger().focus();
    for (const key of ['{Enter}', ' ', '{ArrowDown}']) {
      await user.keyboard(key);
    }
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('FR4: keeps focus when it becomes disabled while focused', () => {
    const {rerender} = render(<Harness isDisabled={false} />);
    act(() => trigger().focus());
    rerender(<Harness isDisabled />);
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveAttribute('aria-disabled', 'true');
  });
});
