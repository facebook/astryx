// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file list.test.ts
 * @input The list domain of the UIKit constants table (list.ts) and the
 *   motion role registry (motion/roles.ts)
 * @output Proof that the list table registers its motion roles: the
 *   deselect's clock and curve are roles named by their paths, and the cell
 *   highlight's release (read by the press layer's stylesheet at build time)
 *   is not
 * @position Testing for /packages/core/src/motion/uikit/list.ts
 */

import {beforeAll, describe, expect, it} from 'vitest';
import {listMotionRoles, motionRoleIn, motionRoleOf} from '../roles';
import {list, registerListTable} from './list';

// The table is plain data: its roles exist once its register function has
// run, as a list's touch module runs it before its first motion.
beforeAll(() => {
  registerListTable();
});

describe('the list table’s motion roles', () => {
  it('makes the deselect’s clock and curve roles a theme may retune', () => {
    expect(motionRoleIn(list.deselect, 'navigationPopMs')).toMatchObject({
      id: 'list.deselect.navigationPopMs',
      kind: 'duration',
      variable: '--motion-list-deselect-navigation-pop-ms',
      value: 350,
    });
    expect(motionRoleOf(list.deselect.navigationPopCurve)).toMatchObject({
      id: 'list.deselect.navigationPopCurve',
      kind: 'curve',
      variable: '--motion-list-deselect-navigation-pop-curve',
    });
  });

  it('leaves the highlight’s release out: the press layer reads it at build time', () => {
    expect(motionRoleIn(list.highlight, 'releaseMs')).toBeUndefined();
    expect(motionRoleOf(list.highlight.releaseCurve)).toBeUndefined();
    expect(
      listMotionRoles().some(role => role.id.startsWith('list.highlight')),
    ).toBe(false);
  });
});
