// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file components/index.ts
 * @input None
 * @output Every component the native package adds to, by core component name
 * @position The generator walks this list; each entry pairs with core's
 *   `<Name>/<Name>.doc.mjs`
 */

import type {NativeAdditions} from '../contract/fromComponentDoc.js';
import {selector} from './Selector.js';

export const NATIVE_COMPONENTS: readonly NativeAdditions[] = [selector];
