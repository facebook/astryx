// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file experimental.test.ts
 * @input The `@astryxdesign/core/List/experimental` entry, the package root,
 *   the ordinary List subpath, the hooks and utils subpaths, and
 *   package.json's exports map
 * @output Proof that the experimental List reorder surface is exported where
 *   spec:AST-017 FR21 puts it and nowhere else, and that it reorders a list
 *   whose rows are not ListItems
 * @position Testing for /packages/core/src/List/experimental.ts
 */

import {useId, useRef, useState, type ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import pkg from '../../package.json';
import * as hooks from '../hooks';
import * as root from '../index';
import * as utils from '../utils';
import * as list from './index';
import * as reorder from './experimental';

const NAMES = [
  'useListReorder',
  'ListReorderContext',
  'ListReorderHandle',
  'LIST_REORDER_FIXED_ROW_ATTRIBUTE',
] as const;

describe('@astryxdesign/core/List/experimental', () => {
  it('exports the reorder surface', () => {
    for (const name of NAMES) {
      expect(reorder[name], name).toBeDefined();
    }
    expect(reorder.LIST_REORDER_FIXED_ROW_ATTRIBUTE).toBe(
      'data-astryx-reorder-fixed',
    );
  });

  it('is a subpath of its own, never re-exported from the root or an ordinary subpath', () => {
    expect(pkg.exports['./List/experimental']).toMatchObject({
      source: './src/List/experimental.ts',
    });
    for (const name of NAMES) {
      expect(name in root, `root re-exports ${name}`).toBe(false);
      expect(name in list, `List re-exports ${name}`).toBe(false);
      expect(name in hooks, `hooks re-exports ${name}`).toBe(false);
      expect(name in utils, `utils re-exports ${name}`).toBe(false);
    }
  });

  it('reorders a list whose rows hold their own content', async () => {
    const onChange = vi.fn();
    function Records(): ReactNode {
      const listRef = useRef<HTMLOListElement>(null);
      const hintId = useId();
      const [items, setItems] = useState(['Alpha', 'Beta', 'Gamma']);
      const session = reorder.useListReorder(
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
        <reorder.ListReorderContext value={session}>
          <ol ref={listRef}>
            {items.map(item => (
              <li
                key={item}
                {...(item === 'Gamma'
                  ? {[reorder.LIST_REORDER_FIXED_ROW_ATTRIBUTE]: ''}
                  : null)}>
                <input aria-label={`${item} name`} defaultValue={item} />
                {item === 'Gamma' ? null : (
                  <reorder.ListReorderHandle
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
        </reorder.ListReorderContext>
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
});
