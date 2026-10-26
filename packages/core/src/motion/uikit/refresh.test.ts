// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file refresh.test.ts
 * @input vitest, the refresh-control table and the motion role registry
 * @output Covers registerRefreshControlTable: the table's values stay
 *   internal constants, before and after the call (no motion role)
 * @position Testing; colocated with refresh.ts
 */

import {describe, expect, it} from 'vitest';
import {listMotionRoles} from '../roles';
import {refreshControl, registerRefreshControlTable} from './refresh';

const refreshRoles = () =>
  listMotionRoles()
    .map(role => role.id)
    .filter(id => id.startsWith('refreshControl.'))
    .sort();

describe('registerRefreshControlTable', () => {
  it('keeps every value an internal constant, registered or not', () => {
    // spec:AST-094 FR4 names none of the refresh control's values as a role.
    expect(refreshControl.endMs).toBe(300);
    expect(refreshRoles()).toEqual([]);
    registerRefreshControlTable();
    registerRefreshControlTable();
    expect(refreshRoles()).toEqual([]);
    expect(refreshControl.endMs).toBe(300);
  });
});
