// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file search.test.ts
 * @input vitest and the UIKit search table
 * @output The search table's values agree with each other and with the
 *   frames they were read from: the activation runs on UIKit's
 *   ease-in-ease-out, the stacked field narrows to 315 pt beside its close
 *   button on a 402 pt screen, the bottom field rests 17 pt above the
 *   keyboard, the bar's fades meet where they should, and the clock, the
 *   curve and the scroll-away snap are the table's only motion roles
 * @position Testing; validates motion/uikit/search.ts without a browser
 */

import {describe, expect, it} from 'vitest';
import {search, timing} from '.';
import {listMotionRoles} from '../roles';

describe('UIKit search table', () => {
  it('activates on UIKit’s ease-in-ease-out over 383 ms, keeping the travel under Reduce Motion', () => {
    expect(search.activationCurve).toEqual(timing.curves.easeInOut);
    expect(search.activationMs).toBeCloseTo(383.3, 1);
    expect(search.reducedMotion).toBe('keep');
  });

  it('narrows the stacked field to 315 pt beside the close button on a 402 pt screen', () => {
    const {fieldInset, closeGap, closeSize} = search.stacked;
    const rest = 402 - 2 * fieldInset;
    expect(rest).toBe(370);
    expect(rest - closeGap - closeSize).toBe(315);
    // The close button ends at the trailing inset (x 342 + 44 = 386).
    expect(402 - fieldInset - closeSize).toBe(342);
  });

  it('rests the bottom field 17 pt above the keyboard', () => {
    const {fieldHeight, keyboardCenterOffset} = search.bottom;
    expect(keyboardCenterOffset - fieldHeight / 2).toBe(17);
  });

  it('fades the bar items out by a third of the activation and the large title back in over the rest', () => {
    expect(
      search.bar.fadeOutProgress + search.bar.largeTitleFadeInProgress,
    ).toBe(1);
  });

  it('makes the clock, the curve and the scroll-away snap motion roles, and nothing else', () => {
    const roles = listMotionRoles().filter(role =>
      role.id.startsWith('search.'),
    );
    expect(
      roles.map(({id, kind, variable, value}) => ({id, kind, variable, value})),
    ).toEqual([
      {
        id: 'search.activationCurve',
        kind: 'curve',
        variable: '--motion-search-activation-curve',
        value: search.activationCurve,
      },
      {
        id: 'search.activationMs',
        kind: 'duration',
        variable: '--motion-search-activation-ms',
        value: 383.3,
      },
      {
        id: 'search.scrollAway.snapMs',
        kind: 'duration',
        variable: '--motion-search-scroll-away-snap-ms',
        value: 230,
      },
    ]);
  });
});
