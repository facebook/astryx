// Copyright (c) Meta Platforms, Inc. and affiliates.

import {expect, test} from '@playwright/test';

test('fails on purpose: a new browser spec must fail pr-a11y', () => {
  expect(1).toBe(2);
});
