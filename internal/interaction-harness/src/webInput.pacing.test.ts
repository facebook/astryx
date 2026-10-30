// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file webInput.pacing.test.ts
 * @input webInput.ts's wheel pacing error and re-take
 * @output Unit cases: a wheel burst off pace names its gaps, and a proof is
 *   re-taken once, only on that error, with the re-take listed.
 * @position Node unit tests beside the harness's browser self-tests.
 *
 * SYNC: When modified, update webInput.ts (WheelPacingError,
 *   retakeOnWheelPacing).
 */

import {describe, expect, it} from 'vitest';
import {retakeOnWheelPacing, WheelPacingError} from './webInput';

describe('WheelPacingError', () => {
  it('names the longest gap, the bound and every gap', () => {
    const error = new WheelPacingError(100, [16, 16, 141, 0, 16]);
    expect(error.name).toBe('WheelPacingError');
    expect(error.message).toMatch(/a gap of 141 ms, over its 100 ms/);
    expect(error.message).toMatch(/gaps 16, 16, 141, 0, 16 ms/);
    expect(error.receivedGapsMs).toEqual([16, 16, 141, 0, 16]);
  });
});

describe('retakeOnWheelPacing', () => {
  const offPace = () => new WheelPacingError(100, [16, 120]);

  it('stays red when both attempts are off pace, with one re-take listed', async () => {
    const testInfo = {
      annotations: [] as {type: string; description?: string}[],
    };
    let attempts = 0;
    await expect(
      retakeOnWheelPacing(testInfo, async () => {
        attempts += 1;
        throw offPace();
      }),
    ).rejects.toBeInstanceOf(WheelPacingError);
    expect(attempts).toBe(2);
    expect(testInfo.annotations.map(a => a.type)).toEqual(['wheel-retake']);
  });

  it('never re-takes a product failure after input that kept its pace', async () => {
    const testInfo = {
      annotations: [] as {type: string; description?: string}[],
    };
    let attempts = 0;
    await expect(
      retakeOnWheelPacing(testInfo, async () => {
        attempts += 1;
        throw new Error('the gallery did not page');
      }),
    ).rejects.toThrow('the gallery did not page');
    expect(attempts).toBe(1);
    expect(testInfo.annotations).toEqual([]);
  });

  it('passes on a good second attempt after one off pace, and lists the re-take', async () => {
    const testInfo = {
      annotations: [] as {type: string; description?: string}[],
    };
    const seen: number[] = [];
    const result = await retakeOnWheelPacing(testInfo, async n => {
      seen.push(n);
      if (n === 1) {
        throw offPace();
      }
      return 'paged';
    });
    expect(result).toBe('paged');
    expect(seen).toEqual([1, 2]);
    expect(testInfo.annotations).toEqual([
      {type: 'wheel-retake', description: offPace().message},
    ]);
  });
});
