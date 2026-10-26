// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file search.test.ts
 * @input vitest and the UIKit search table
 * @output The search table's values agree with each other and with the
 *   frames they were read from: the activation runs on UIKit's
 *   ease-in-ease-out, the stacked field narrows to 315 pt beside its close
 *   button on a 402 pt screen, the bottom field rests 17 pt above the
 *   keyboard, its geometry and measured frames agree (336 pt at rest, 308
 *   active beside a 38 pt close button, every frame table in time order
 *   ending where the field rests), the bar's fades meet where they should,
 *   and the clock, the curve and the scroll-away snap are the table's only
 *   motion roles
 * @position Testing; validates motion/uikit/search.ts without a browser
 */

import {describe, expect, it, vi} from 'vitest';
import {registerSearchTable, search, timing} from '.';
import {listMotionRoles} from '../roles';

registerSearchTable();

describe('UIKit search table', () => {
  it('activates on UIKit’s ease-in-ease-out over 383 ms', () => {
    expect(search.activationCurve).toEqual(timing.curves.move);
    expect(search.activationMs).toBeCloseTo(383.3, 1);
  });

  it('holds no Reduce Motion setting: design:reduced-motion decides', () => {
    expect('reducedMotion' in search).toBe(false);
  });

  it('narrows the stacked field to 315 pt beside the close button on a 402 pt screen', () => {
    const {fieldInset, closeGap, closeSize} = search.stacked;
    const rest = 402 - 2 * fieldInset;
    expect(rest).toBe(370);
    expect(rest - closeGap - closeSize).toBe(315);
    // The close button ends at the trailing inset (x 342 + 44 = 386).
    expect(402 - fieldInset - closeSize).toBe(342);
  });

  it('rests the bottom field 17 pt above the keyboard, as the cited frames put it', () => {
    const {fieldHeight, keyboardCenterOffset} = search.bottom;
    // The cited capture: the pinned field's centre at y 503 with the
    // keyboard's top at 539 (the value's @source).
    const centre = 503;
    const keyboardTop = 539;
    expect(keyboardCenterOffset).toBe(keyboardTop - centre);
    expect(keyboardTop - (centre + fieldHeight / 2)).toBe(17);
  });

  it('lays the bottom field out as measured on a 402 pt screen', () => {
    const {restInset, activeInset, closeSize, closeGap, activeWidth} =
      search.bottom;
    expect(402 - 2 * restInset).toBe(336);
    expect(402 - activeInset - closeSize - closeGap - activeInset).toBe(
      activeWidth,
    );
    // The close button at x 347, the active field ending at x 325.
    expect(402 - activeInset - closeSize).toBe(347);
    expect(activeInset + activeWidth).toBe(325);
  });

  it('keeps every bottom frame table in time order, ending where the field rests', () => {
    const {
      activationFrames,
      cancelFrames,
      closeEnterFrames,
      closeExitFrames,
      cancelNarrowing,
      restInset,
      activeInset,
      closeSize,
      closeGap,
    } = search.bottom;
    for (const table of [
      activationFrames,
      cancelFrames,
      closeEnterFrames,
      closeExitFrames,
    ]) {
      const times = table.map(row => row[0]);
      expect(times[0]).toBe(0);
      for (let i = 1; i < times.length; i++) {
        expect(times[i]).toBeGreaterThan(times[i - 1]);
      }
    }
    expect(activationFrames[0].slice(1)).toEqual([0, 0, 1]);
    expect(activationFrames.at(-1)?.slice(1)).toEqual([1, 1, 1]);
    expect(cancelFrames.at(-1)?.slice(1)).toEqual([0, 0, 1]);
    expect(closeEnterFrames.at(-1)?.slice(1)).toEqual([1, 1, 0]);
    expect(closeExitFrames.at(-1)?.[1]).toBe(0);
    // A cancel starts with the trailing edge `cancelNarrowing` inside the
    // active field's (x 309 on a 402 pt screen).
    const travel = 402 - restInset - (402 - activeInset - closeSize - closeGap);
    expect(cancelFrames[0][2]).toBeCloseTo(
      (travel + cancelNarrowing) / travel,
      2,
    );
  });

  it('fades the bar items out by a third of the activation and the large title back in over the rest', () => {
    expect(
      search.bar.fadeOutProgress + search.bar.largeTitleFadeInProgress,
    ).toBe(1);
  });

  it('registers nothing when the table is read; registerSearchTable registers its roles, once', async () => {
    vi.resetModules();
    const roles = await import('../roles');
    const table = await import('./search');
    const searchRoles = () =>
      roles
        .listMotionRoles()
        .map(role => role.id)
        .filter(id => id.startsWith('search.'))
        .sort();
    expect(searchRoles()).toEqual([]);
    table.registerSearchTable();
    table.registerSearchTable();
    expect(searchRoles()).toEqual([
      'search.activationCurve',
      'search.activationMs',
      'search.scrollAway.snapMs',
    ]);
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
