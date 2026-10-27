// Copyright (c) Meta Platforms, Inc. and affiliates.

import {renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';

import {takeOpenerActivation, useOpenerActivation} from './openerActivation';

describe('openerActivation', () => {
  afterEach(() => {
    takeOpenerActivation();
  });

  it('records the click that opens a viewer while one listens', () => {
    const {unmount} = renderHook(() => useOpenerActivation(true));
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.click();
    expect(takeOpenerActivation()?.target).toBe(opener);
    unmount();
    opener.remove();
  });

  it('clears the record when the last viewer goes', () => {
    const {unmount} = renderHook(() => useOpenerActivation(true));
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.click();
    unmount();
    expect(takeOpenerActivation()).toBeNull();
    opener.remove();
  });
});
