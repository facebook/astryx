// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListReorderRows.test.tsx
 * @input List's reorder session (useListReorder.ts) and its handle
 *   (ListReorderHandle.tsx), run outside a List
 * @output Proof that the session reorders a list whose rows are not
 *   ListItems: rows of any tag holding their own content, the handle anywhere
 *   inside each, a fixed row bounding the others, and a handle's whole
 *   accessible name
 * @position Testing for /packages/core/src/List/useListReorder.ts as Lab's
 *   ListInput runs it (an internal module import)
 */

import {useId, useRef, useState, type ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ListReorderHandle} from '../ListReorderHandle';
import {
  FIXED_ROW_ATTRIBUTE,
  ListReorderContext,
  useListReorder,
} from '../useListReorder';

describe('the List reorder session outside a List', () => {
  it('reorders a list whose rows hold their own content', async () => {
    const onChange = vi.fn();
    function Records(): ReactNode {
      const listRef = useRef<HTMLOListElement>(null);
      const hintId = useId();
      const [items, setItems] = useState(['Alpha', 'Beta', 'Gamma']);
      const session = useListReorder(
        listRef,
        (fromIndex, toIndex) => {
          const next = [...items];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          onChange(next);
          setItems(next);
        },
        hintId,
      );
      return (
        <ListReorderContext value={session}>
          <ol ref={listRef}>
            {items.map(item => (
              <li
                key={item}
                {...(item === 'Gamma' ? {[FIXED_ROW_ATTRIBUTE]: ''} : null)}>
                <input aria-label={`${item} name`} defaultValue={item} />
                {item === 'Gamma' ? null : (
                  <ListReorderHandle
                    label={item}
                    aria-label={item === 'Beta' ? 'Move record 2' : undefined}
                  />
                )}
              </li>
            ))}
          </ol>
          <span id={hintId} hidden>
            Reorder instructions
          </span>
        </ListReorderContext>
      );
    }
    const user = userEvent.setup();
    render(<Records />);
    const handle = screen.getByRole('button', {name: 'Reorder Alpha'});
    expect(handle).toHaveAccessibleDescription('Reorder instructions');
    expect(screen.queryByRole('button', {name: 'Reorder Gamma'})).toBeNull();
    // A whole name replaces "Reorder {label}".
    expect(screen.getByRole('button', {name: 'Move record 2'})).toBeVisible();
    handle.focus();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(['Beta', 'Alpha', 'Gamma']);
    // The fixed row bounds the others: Alpha cannot pass Gamma.
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', {name: 'Reorder Alpha'})).toHaveFocus();
  });

  it('moves rows of any tag, with the handle deep inside each', async () => {
    const onReorder = vi.fn();
    function Cards(): ReactNode {
      const listRef = useRef<HTMLDivElement>(null);
      const hintId = useId();
      const session = useListReorder(listRef, onReorder, hintId);
      return (
        <ListReorderContext value={session}>
          <div ref={listRef} role="list">
            {['Alpha', 'Beta'].map(item => (
              <div key={item} role="listitem">
                <span>
                  {item}
                  <ListReorderHandle label={item} />
                </span>
              </div>
            ))}
          </div>
          <span id={hintId} hidden>
            Reorder instructions
          </span>
        </ListReorderContext>
      );
    }
    const user = userEvent.setup();
    render(<Cards />);
    screen.getByRole('button', {name: 'Reorder Alpha'}).focus();
    await user.keyboard('{ArrowDown}');
    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });
});
