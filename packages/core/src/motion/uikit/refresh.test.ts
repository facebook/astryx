// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file refresh.test.ts
 * @input vitest, the refresh-control table and the motion role registry
 * @output Covers registerRefreshControlTable: reading the table registers
 *   nothing; the call registers the table's motion roles, once
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
  it('registers the table’s motion roles only when called, once', () => {
    // Reading a value registers nothing.
    expect(refreshControl.endMs).toBe(300);
    expect(refreshRoles()).toEqual([]);
    registerRefreshControlTable();
    registerRefreshControlTable();
    expect(refreshRoles()).toEqual([
      'refreshControl.endMs',
      'refreshControl.exitMs',
      'refreshControl.spinMs',
      'refreshControl.triggerTurnSpring',
    ]);
  });
});
