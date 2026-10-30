// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file refresh.test.ts
 * @input vitest, the refresh-control table and the motion role registry
 * @output Covers the refresh-control table staying internal constants: none
 *   of its values is a motion role
 * @position Testing; colocated with refresh.ts
 */

import {describe, expect, it} from 'vitest';
import {listMotionRoles} from '../roles';
import {refreshControl} from './refresh';

describe('refreshControl', () => {
  it('is internal constants, read as they are: none is a motion role', () => {
    // spec:AST-094 FR4 names none of the refresh control's values as a role.
    expect(refreshControl.endMs).toBe(300);
    expect(
      listMotionRoles().filter(role => role.id.startsWith('refreshControl.')),
    ).toEqual([]);
  });
});
