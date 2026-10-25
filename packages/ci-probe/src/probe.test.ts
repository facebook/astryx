// Copyright (c) Meta Platforms, Inc. and affiliates.

import {expect, it} from 'vitest';

it('fails on purpose: a new package test must fail CI', () => {
  expect(1).toBe(2);
});
