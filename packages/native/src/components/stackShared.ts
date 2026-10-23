// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file components/stackShared.ts
 * @input None
 * @output The slot and web-only declarations HStack and VStack share
 * @position Read by components/HStack.ts and components/VStack.ts
 */

import type {SlotKind} from '../contract/fromComponentDoc.js';

export const STACK_SLOTS: Readonly<Record<string, SlotKind>> = {
  children: 'content',
};

export const STACK_WEB_ONLY: Readonly<Record<string, string>> = {
  isScrollable: 'CSS overflow; native scrolling is a container of its own',
};
