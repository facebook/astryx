// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useResizable.test.ts
 * @input Uses vitest, @testing-library/react renderHook, useResizable
 * @output Unit tests for useResizable callback/prop stability
 * @position Testing; validates useResizable.ts implementation
 *
 * SYNC: When useResizable.ts changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useResizable} from './useResizable';
import type {UseResizableSingleConfig} from './useResizable';

describe('useResizable callback stability', () => {
  it('keeps expand, resize, and props._snaps stable across rerenders when snaps is omitted', () => {
    const config: UseResizableSingleConfig = {
      defaultSize: 200,
      minSizePx: 100,
      maxSizePx: 400,
    };
    const {result, rerender} = renderHook(() => useResizable(config));

    const first = result.current;
    rerender();
    const second = result.current;

    expect(second.expand).toBe(first.expand);
    expect(second.resize).toBe(first.resize);
    expect(second.props._snaps).toBe(first.props._snaps);
  });

  it('still returns a stable snaps identity for a caller-provided array across rerenders', () => {
    const snaps = [100, 200, 300];
    const config: UseResizableSingleConfig = {
      defaultSize: 200,
      minSizePx: 100,
      maxSizePx: 400,
      snaps,
    };
    const {result, rerender} = renderHook(() => useResizable(config));

    expect(result.current.props._snaps).toBe(snaps);
    rerender();
    expect(result.current.props._snaps).toBe(snaps);
  });
});
