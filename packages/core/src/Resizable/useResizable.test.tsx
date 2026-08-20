// Copyright (c) Meta Platforms, Inc. and affiliates.

import {renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {useResizable} from './useResizable';

describe('useResizable identity', () => {
  it('keeps callbacks stable when optional snaps are omitted', () => {
    const {result, rerender} = renderHook(() =>
      useResizable({defaultSize: 200, minSizePx: 100, maxSizePx: 400}),
    );
    const first = {
      expand: result.current.expand,
      resize: result.current.resize,
      snaps: result.current.props._snaps,
    };

    rerender();

    expect(result.current.expand).toBe(first.expand);
    expect(result.current.resize).toBe(first.resize);
    expect(result.current.props._snaps).toBe(first.snaps);
  });
});
